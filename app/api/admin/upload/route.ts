import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 500 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function isAuthed(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    if (!ALLOWED.has(file.type))
      return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP formatı desteklenir." }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_BYTES)
      return NextResponse.json({ error: `Dosya 500 KB sınırını aşıyor.` }, { status: 400 });
    return NextResponse.json({ base64: `data:${file.type};base64,${buf.toString("base64")}` });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
