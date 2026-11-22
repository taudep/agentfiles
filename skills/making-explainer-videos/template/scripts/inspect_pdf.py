#!/usr/bin/env -S uv run --no-config --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf>=1.24"]
# ///
"""
inspect_pdf.py — read the source PDF and find PaperZoom coordinates.

  --text              dump every page's text (read the whole source before scripting)
  --page N            list page N's text lines with normalized [x0, y0, x1, y1] rects
                      (copy a line's rect, or union several, into a shot's `rect`)
  --page N --grid     also write public/paper/page-N-grid.png: the page with a labelled
                      0.1 grid, so a figure's rect can be read off by eye
  --find "text"       show every hit of a snippet on every page (search is case-insensitive,
                      so check a figure title doesn't also match body prose)

Usage:
  npm run inspect -- --text
  npm run inspect -- --page 6 --grid
  npm run inspect -- --find "Q4_K_M"
"""

import argparse
import json
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent


def nrect(r, page) -> list[float]:
    w, h = page.rect.width, page.rect.height
    return [round(r[0] / w, 3), round(r[1] / h, 3), round(r[2] / w, 3), round(r[3] / h, 3)]


def lines(page):
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            text = "".join(s["text"] for s in ln["spans"]).strip()
            if text:
                yield text, ln["bbox"]


def grid(page, n: int) -> Path:
    zoom = 2
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
    out = ROOT / "public" / "paper" / f"page-{n}-grid.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    pix.save(out)
    # draw the grid onto a copy of the page, then render that
    doc = pymupdf.open()
    doc.insert_pdf(page.parent, from_page=n - 1, to_page=n - 1)
    p = doc[0]
    w, h = p.rect.width, p.rect.height
    for i in range(1, 10):
        x, y = w * i / 10, h * i / 10
        p.draw_line((x, 0), (x, h), color=(1, 0, 0), width=0.4)
        p.draw_line((0, y), (w, y), color=(1, 0, 0), width=0.4)
        p.insert_text((x + 2, 9), f"{i / 10:.1f}", fontsize=7, color=(1, 0, 0))
        p.insert_text((2, y - 2), f"{i / 10:.1f}", fontsize=7, color=(1, 0, 0))
    p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).save(out)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--text", action="store_true")
    ap.add_argument("--page", type=int)
    ap.add_argument("--grid", action="store_true")
    ap.add_argument("--find")
    ap.add_argument("--pdf", help="defaults to scenes.json 'source'")
    a = ap.parse_args()

    src = a.pdf or json.loads((ROOT / "scenes.json").read_text())["source"]
    doc = pymupdf.open(ROOT / src)

    if a.text:
        for i, page in enumerate(doc, 1):
            print(f"\n===== page {i} =====\n{page.get_text()}")
    if a.page:
        page = doc[a.page - 1]
        for text, bbox in lines(page):
            print(f"{nrect(bbox, page)}  {text[:90]}")
        if a.grid:
            print(f"grid: {grid(page, a.page).relative_to(ROOT)}")
    if a.find:
        for i, page in enumerate(doc, 1):
            for r in page.search_for(a.find):
                print(f"page {i}  {nrect(r, page)}")
    if not (a.text or a.page or a.find):
        ap.print_help()


if __name__ == "__main__":
    main()
