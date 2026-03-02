import { NextRequest, NextResponse } from "next/server";

const THUMBNAIL_API = "https://thumbnails.roblox.com/v1/assets";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }

  const res = await fetch(
    `${THUMBNAIL_API}?assetIds=${id}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`,
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Roblox API error" }, { status: 502 });
  }

  const body = await res.json();
  const entry = body.data?.[0];

  if (!entry?.imageUrl) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json({ url: entry.imageUrl });
}
