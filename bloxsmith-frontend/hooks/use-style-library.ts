"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { SavedStyle, SerializedInstance, DesignTokens } from "@/lib/studio/types";

export function useStyleLibrary() {
  const [styles, setStyles] = useState<SavedStyle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStyles = useCallback(async () => {
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) {
      setStyles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getSupabase()
      .from("styles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setStyles(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        createdAt: new Date(row.created_at).getTime(),
        sourceGame: row.source_game ?? undefined,
        tree: row.tree as SerializedInstance,
        tokens: row.tokens as DesignTokens,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const saveStyle = useCallback(
    async (style: { name: string; sourceGame?: string; tree: SerializedInstance; tokens: DesignTokens }): Promise<string> => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await getSupabase()
        .from("styles")
        .insert({
          user_id: user.id,
          name: style.name,
          source_game: style.sourceGame ?? null,
          tree: style.tree,
          tokens: style.tokens,
        })
        .select("id")
        .single();

      if (error) throw error;

      await fetchStyles();
      return data.id;
    },
    [fetchStyles],
  );

  const deleteStyle = useCallback(
    async (id: string) => {
      const { error } = await getSupabase().from("styles").delete().eq("id", id);
      if (error) throw error;
      await fetchStyles();
    },
    [fetchStyles],
  );

  return { styles, loading, saveStyle, deleteStyle };
}
