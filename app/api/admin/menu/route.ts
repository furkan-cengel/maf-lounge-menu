import { NextRequest, NextResponse } from "next/server";

const GH = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER ?? "";
const REPO = process.env.GITHUB_REPO ?? "";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const FILE = process.env.GITHUB_FILE_PATH ?? "maf-lounge-menu/data/menu.json";

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

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const res = await fetch(
      `${GH}/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
      { headers: ghHeaders(), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
    const file = await res.json();
    const content = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    return NextResponse.json({ content, sha: file.sha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { content, sha } = await req.json();
    const encoded = Buffer.from(JSON.stringify(content, null, 2), "utf-8").toString("base64");
    const res = await fetch(`${GH}/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: "PUT",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore: update menu via admin panel",
        content: encoded,
        sha,
        branch: BRANCH,
      }),
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
    const result = await res.json();
    return NextResponse.json({ success: true, sha: result.content.sha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
