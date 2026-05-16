import menuData from "@/data/menu.json";
import type { MenuData } from "@/types/menu";
import { MenuApp } from "@/components/MenuApp";

const data = menuData as MenuData;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const masa = params.masa;
  const tableNumber = typeof masa === "string" ? masa : null;

  return <MenuApp data={data} tableNumber={tableNumber} />;
}
