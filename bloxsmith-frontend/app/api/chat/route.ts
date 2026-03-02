import { NextRequest, NextResponse } from "next/server";
import type { SerializedInstance } from "@/lib/studio/types";
import { getStyleGuide, buildSystemPrompt, buildAdaptivePrompt } from "@/lib/studio/styles/registry";
import { DEFAULT_STYLE_ID } from "@/lib/studio/styles/presets";
import { getServerSupabase } from "@/lib/supabase-server";
import { FREE_GENERATION_LIMIT, MODELS, DEFAULT_MODEL, MIN_BALANCE_CENTS, calculateCostCents } from "@/lib/billing";

function serializeTrees(trees: SerializedInstance[]): string {
  if (trees.length === 0) return "";
  const names = trees.map(t => t.name);
  return `ScreenGUIs currently in StarterGui: ${names.join(", ")}. Destroy any with the same name before creating new ones.`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessToken = authHeader.slice(7);

  const routerKey = process.env.OPENROUTER_API_KEY;
  if (!routerKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const supabase = getServerSupabase(accessToken);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { messages, trees, model: modelId, styleId } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    trees: SerializedInstance[];
    model?: string;
    styleId?: string;
  };

  const model = MODELS[modelId ?? DEFAULT_MODEL];
  if (!model) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }

  const isAdaptive = styleId === "adaptive";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("balance_cents, free_generations_used, is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isAdmin = profile.is_admin === true;
  const isFreeGen = profile.free_generations_used < FREE_GENERATION_LIMIT;
  if (!isAdmin && !isFreeGen && profile.balance_cents < MIN_BALANCE_CENTS) {
    return NextResponse.json(
      { error: "Insufficient balance. Add credits to continue." },
      { status: 402 },
    );
  }

  let systemPrompt: string;
  let chatMessages: { role: string; content: string }[];

  if (isAdaptive) {
    systemPrompt = buildAdaptivePrompt(model.name, trees);
    chatMessages = messages;
  } else {
    const styleGuide = getStyleGuide(styleId ?? DEFAULT_STYLE_ID);
    systemPrompt = buildSystemPrompt(model.name, styleGuide);
    const userMessage = messages[messages.length - 1];
    chatMessages = [
      { role: "system", content: serializeTrees(trees) },
      userMessage,
    ];
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${routerKey}`,
      "HTTP-Referer": "https://bloxsmith.net",
      "X-OpenRouter-Title": "Bloxsmith",
    },
    body: JSON.stringify({
      model: model.openRouterId,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
      stream: true,
      max_tokens: 16384,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Request failed" } }));
    return NextResponse.json(
      { error: err.error?.message ?? "Request failed" },
      { status: res.status },
    );
  }

  if (isAdmin || isFreeGen) {
    if (isFreeGen && !isAdmin) {
      await supabase
        .from("profiles")
        .update({ free_generations_used: profile.free_generations_used + 1 })
        .eq("id", user.id);
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const userId = user.id;
  const upstream = res.body!;
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = upstream.getReader();
  const decoder = new TextDecoder();

  (async () => {
    let usage: { prompt_tokens?: number; completion_tokens?: number } | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await writer.write(value);

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.usage) usage = parsed.usage;
          } catch {
            // partial JSON chunk, skip
          }
        }
      }
    } finally {
      await writer.close();
    }

    const inputTokens = usage?.prompt_tokens ?? 0;
    const outputTokens = usage?.completion_tokens ?? 0;
    const costCents = calculateCostCents(model, inputTokens, outputTokens);

    if (costCents > 0) {
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("balance_cents")
        .eq("id", userId)
        .single();

      const currentBalance = freshProfile?.balance_cents ?? 0;
      const newBalance = Math.max(0, currentBalance - costCents);

      await supabase
        .from("profiles")
        .update({ balance_cents: newBalance })
        .eq("id", userId);

      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "generation",
          amount_cents: -costCents,
          balance_after_cents: newBalance,
          description: `${model.name} generation (${inputTokens + outputTokens} tokens)`,
        });
    }
  })();

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
