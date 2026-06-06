import { NextRequest, NextResponse } from "next/server";

const GH = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER ?? "";
const REPO = process.env.GITHUB_REPO ?? "";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const FILE = process.env.GITHUB_FILE_PATH ?? "data/menu.json";
const MAX_CONTENT_BYTES = 900_000;

function isAuthed(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// Remove base64 images server-side so menu.json never grows past 1 MB,
// regardless of what client version (browser cache, old draft) sends us.
function stripBase64Images(content: unknown): unknown {
  if (!content || typeof content !== "object" || Array.isArray(content)) return content;
  const obj = content as Record<string, unknown>;
  if (!Array.isArray(obj.items)) return content;
  return {
    ...obj,
    items: (obj.items as Array<Record<string, unknown>>).map((item) => {
      const { image, ...rest } = item;
      return typeof image === "string" && image.startsWith("data:") ? rest : item;
    }),
  };
}

// Read headers — no auth so public-repo reads work even if token is wrong/missing.
function readHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// Write headers — auth required for committing to GitHub.
function writeHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchCurrentSha(): Promise<string> {
  const res = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
    { headers: readHeaders(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  const file = await res.json();
  const sha = file.sha as string | undefined;
  if (!sha) throw new Error(`SHA alınamadı (size: ${file.size}, encoding: ${file.encoding})`);
  return sha;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Reads don't need auth — only owner/repo must be configured.
  if (!OWNER || !REPO) {
    return NextResponse.json(
      { error: "GITHUB_OWNER veya GITHUB_REPO ortam değişkeni eksik" },
      { status: 500 }
    );
  }
  try {
    // Fetch metadata — sha is always present even for large files.
    const metaRes = await fetch(
      `${GH}/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
      { headers: readHeaders(), cache: "no-store" }
    );
    if (!metaRes.ok) {
      const body = await metaRes.text();
      throw new Error(`GitHub ${metaRes.status}: ${body}`);
    }
    const meta = await metaRes.json();
    const sha = meta.sha as string;

    let content: unknown;
    if (meta.content && meta.encoding === "base64") {
      // Small file — content is inlined in the Contents API response.
      content = JSON.parse(Buffer.from(meta.content, "base64").toString("utf-8"));
    } else {
      // Large file (>1 MB) — Contents API returns empty content; use Blobs API instead.
      const blobRes = await fetch(
        `${GH}/repos/${OWNER}/${REPO}/git/blobs/${sha}`,
        { headers: { ...readHeaders(), Accept: "application/vnd.github.raw+json" }, cache: "no-store" }
      );
      if (!blobRes.ok) throw new Error(`Blob fetch failed: ${blobRes.status}`);
      // Use text() + JSON.parse() — more reliable than .json() for large payloads in serverless.
      content = JSON.parse(await blobRes.text());
    }

    return NextResponse.json({ content, sha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { content } = await req.json();

    // Always strip base64 images server-side — guards against old browser-cached client
    // JS or localStorage drafts sending base64, which would push menu.json past 1 MB.
    const clean = stripBase64Images(content);
    const serialized = JSON.stringify(clean, null, 2);
    if (serialized.length > MAX_CONTENT_BYTES) {
      return NextResponse.json(
        { error: `İçerik çok büyük (${Math.round(serialized.length / 1024)} KB). Base64 görsel kalmış olabilir.` },
        { status: 400 }
      );
    }

    // Always fetch the latest SHA from GitHub — never trust the client-provided value.
    const freshSha = await fetchCurrentSha();

    const encoded = Buffer.from(serialized, "utf-8").toString("base64");
    const res = await fetch(`${GH}/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: "PUT",
      headers: { ...writeHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore: update menu via admin panel",
        content: encoded,
        sha: freshSha,
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
