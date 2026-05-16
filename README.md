# Maf Lounge Cafe — QR Menu

Mobile-only digital menu for Maf Lounge Cafe. Scan a QR code → view the menu instantly, no app needed.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

With a table number:
```
http://localhost:3000/?masa=5
```

## How to Edit the Menu

All menu content lives in **`data/menu.json`** — that's the only file you need to touch.

### Add a new item

Find the category in `data/menu.json` and add an object to its `items` array:

```json
{
  "id": "yeni-urun",
  "name": "Yeni Ürün",
  "description": "Açıklama (isteğe bağlı)",
  "price": 150,
  "image": null
}
```

- `id` — unique slug, lowercase, dashes only
- `description` — can be `null` to hide the description line
- `price` — integer, displayed as `₺150`
- `image` — `null` for the auto-generated thumbnail, or a URL / base64 data URI

### Add a new category

Add an object to the top-level `categories` array:

```json
{
  "id": "tatlilar",
  "name": "Tatlılar",
  "colorHue": 330,
  "items": []
}
```

- `colorHue` — 0–360, controls the thumbnail stripe color (e.g. 200 = teal, 45 = amber, 330 = pink)

### Remove an item or category

Delete its object from the array. The page rebuilds automatically on `npm run dev`.

### Add a photo to an item

Set `"image"` to a public URL:
```json
"image": "https://example.com/photo.jpg"
```

Or a base64 data URI (for self-hosted images with no external dependency):
```json
"image": "data:image/jpeg;base64,/9j/4AAQ..."
```

## QR Code Setup

Generate a QR code pointing to:
```
https://yourdomain.com/?masa=<table-number>
```

The table number appears in the header. Use `masa=5` for table 5, etc.

## Project Structure

```
app/
  layout.tsx          Google Fonts + viewport meta
  page.tsx            Main page (reads ?masa= param)
  globals.css         CSS variables + base styles
components/
  Header.tsx          Sticky header + category nav (client)
  CategorySection.tsx Category title + items list (server)
  MenuItem.tsx        Individual card with press animation (client)
  Thumbnail.tsx       SVG stripe pattern per category (server)
  FloatingButton.tsx  Fixed "Garson" call-waiter button (client)
  Footer.tsx          VAT note + allergen info (server)
data/
  menu.json           ← single source of truth for all content
types/
  menu.ts             TypeScript interfaces
```
