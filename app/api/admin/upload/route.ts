import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const GH = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER ?? "";
const REPO = process.env.GITHUB_REPO ?? "";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const MAX_BYTES = 500 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isAuthed(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
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
      return NextResponse.json({ error: `Görsel 500 KB'dan küçük olmalıdır.` }, { status: 400 });

    const ext = EXT[file.type] ?? "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const githubPath = `public/images/${filename}`;

    // Commit the image as a standalone file — keeps menu.json small.
    const res = await fetch(`${GH}/repos/${OWNER}/${REPO}/contents/${githubPath}`, {
      method: "PUT",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore: upload menu image ${filename}`,
        content: buf.toString("base64"),
        branch: BRANCH,
      }),
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);

    // raw.githubusercontent.com is available immediately after the commit.
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${githubPath}`;
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
