import type { MenuItem } from "@/types/menu";

const CAT_HUE: Record<string, number> = {
  specials: 285, breakfast: 35, toasts: 25, gozleme: 40, burgers: 18,
  pasta: 30, pans: 22, salads: 130, desserts: 320,
  hotcoffee: 28, icecoffee: 200, hotdrinks: 12, tea: 110,
  frappe: 25, shake: 320, frozen: 200, smoothie: 340, lemonade: 60,
  cocktail: 340, cold: 200, extras: 45,
};

export function imgFor(
  item: Pick<MenuItem, "tr" | "cat" | "hue">,
  opts?: { l1?: number; l2?: number }
): string {
  const h = item.hue ?? CAT_HUE[item.cat] ?? 285;
  const l1 = opts?.l1 ?? 18;
  const l2 = opts?.l2 ?? 28;
  const label = (item.tr.name ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const w = 600;
  const hgt = 600;

  const stripes: string[] = [];
  for (let i = 0; i < 24; i++) {
    const y = i * (hgt / 24);
    const tone =
      i % 2 === 0
        ? `oklch(${l1}% .08 ${h})`
        : `oklch(${l2}% .08 ${h})`;
    stripes.push(
      `<rect x="0" y="${y}" width="${w}" height="${hgt / 24 + 0.5}" fill="${tone}"/>`
    );
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hgt}">`,
    `<defs>`,
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="oklch(45% .14 ${h})" stop-opacity=".55"/>`,
    `<stop offset=".55" stop-color="oklch(25% .1 ${h})" stop-opacity="0"/>`,
    `</linearGradient>`,
    `<radialGradient id="v" cx=".5" cy=".4" r=".7">`,
    `<stop offset="0" stop-color="oklch(55% .18 ${h})" stop-opacity=".4"/>`,
    `<stop offset="1" stop-color="oklch(15% .05 ${h})" stop-opacity="0"/>`,
    `</radialGradient>`,
    `</defs>`,
    stripes.join(""),
    `<rect width="${w}" height="${hgt}" fill="url(#g)"/>`,
    `<rect width="${w}" height="${hgt}" fill="url(#v)"/>`,
    `<text x="50%" y="92%" text-anchor="middle" font-family="ui-monospace,monospace" font-size="22" fill="oklch(80% .04 ${h})" opacity=".55" letter-spacing="0.1em">— ${label.toUpperCase()} —</text>`,
    `</svg>`,
  ].join("");

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
