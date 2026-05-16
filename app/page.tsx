import fs from "fs";
import path from "path";
import type { MenuData } from "@/types/menu";
import { MenuApp } from "@/components/MenuApp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filePath = path.join(process.cwd(), "data", "menu.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as MenuData;

  const params = await searchParams;
  const masa = params.masa;
  const tableNumber = typeof masa === "string" ? masa : null;

  return <MenuApp data={data} tableNumber={tableNumber} />;
}
