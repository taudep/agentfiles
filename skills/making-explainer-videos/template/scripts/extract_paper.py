#!/usr/bin/env -S uv run --no-config --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf>=1.24"]
# ///
"""
extract_paper.py — render the source PDF's pages and locate PaperZoom targets.

For every PaperZoom scene in scenes.json, each shot names a page and either
`full: true`, a text snippet to `find` (optionally through `findEnd`), or a
manual normalized `rect: [x0, y0, x1, y1]`. The snippet is located with
PyMuPDF's text search, so zoom targets come from the PDF itself, not guesses.

Outputs:
  public/paper/page-<n>.png      high-res page renders
  src/generated/paper.json       per-scene shots: image, size, rect, line rects

Usage:
  uv run --no-config --script scripts/extract_paper.py [--zoom 3]
"""

import argparse
import json
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PAD = 0.012  # normalized padding around a found region


def norm_rect(r: pymupdf.Rect, page: pymupdf.Page) -> list[float]:
    w, h = page.rect.width, page.rect.height
    return [r.x0 / w, r.y0 / h, r.x1 / w, r.y1 / h]


def search(page: pymupdf.Page, text: str) -> list[pymupdf.Rect]:
    """search_for, tolerant of straight vs curly apostrophes/quotes in the PDF."""
    for variant in (text, text.replace("'", "’"), text.replace('"', "“")):
        hits = page.search_for(variant, quads=False)
        if hits:
            return hits
    return []


def lines_between(page: pymupdf.Page, start: pymupdf.Rect, end: pymupdf.Rect) -> list[pymupdf.Rect]:
    """Per-line rects of every word in reading order from `start` through `end`."""
    words = page.get_text("words")  # x0, y0, x1, y1, text, block, line, word
    centre = lambda r: pymupdf.Point((r[0] + r[2]) / 2, (r[1] + r[3]) / 2)
    i0 = next(i for i, w in enumerate(words) if start.contains(centre(w)))
    i1 = next(i for i, w in enumerate(words) if i >= i0 and end.contains(centre(w)))
    lines: dict[tuple[int, int], pymupdf.Rect] = {}
    for w in words[i0 : i1 + 1]:
        key = (w[5], w[6])
        lines[key] = lines[key] | pymupdf.Rect(w[:4]) if key in lines else pymupdf.Rect(w[:4])
    return list(lines.values())


def find_lines(page: pymupdf.Page, text: str) -> list[pymupdf.Rect]:
    """Return per-line rects for the first hit of `text` (hits may span lines)."""
    hits = search(page, text)
    if not hits:
        return []
    # search_for returns one rect per line per hit; keep the first hit's lines:
    # consecutive rects that continue downward from the first one.
    lines = [hits[0]]
    for r in hits[1:]:
        if r.y0 >= lines[-1].y0 - 1 and r.y0 - lines[-1].y1 < 30:
            lines.append(r)
        else:
            break
    return lines


def resolve_shot(doc: pymupdf.Document, shot: dict, where: str) -> dict:
    page = doc[shot["page"] - 1]
    lines: list[pymupdf.Rect] = []
    if shot.get("full"):
        rect = [0.0, 0.0, 1.0, 1.0]
    elif "rect" in shot:
        rect = shot["rect"]
        if shot.get("highlight"):
            # tables/figures: highlight the whole region as one box
            w, h = page.rect.width, page.rect.height
            lines = [pymupdf.Rect(rect[0] * w, rect[1] * h, rect[2] * w, rect[3] * h)]
    else:
        lines = find_lines(page, shot["find"])
        if not lines:
            sys.exit(f"{where}: text not found on page {shot['page']}: {shot['find']!r}")
        region = pymupdf.Rect(lines[0])
        for r in lines[1:]:
            region |= r
        if "findEnd" in shot:
            # first occurrence of the end snippet at or below the start
            # first occurrence of the end snippet after the start (same column or later)
            # nearest occurrence after the start: below it in the same column, else a later column
            first = lines[0]
            ends = sorted(
                (r for r in search(page, shot["findEnd"]) if r.y0 >= first.y0 - 1 or r.x0 > first.x1),
                key=lambda r: (0 if r.y0 >= first.y0 - 1 and r.x0 < first.x1 + 200 else 1, r.y0),
            )
            if not ends:
                sys.exit(f"{where}: findEnd not found on page {shot['page']}: {shot['findEnd']!r}")
            region |= ends[0]
            lines = lines_between(page, lines[0], ends[0]) if shot.get("highlight") else []
        rect = norm_rect(region, page)
        rect = [max(0, rect[0] - PAD), max(0, rect[1] - PAD), min(1, rect[2] + PAD), min(1, rect[3] + PAD)]
    return {
        "page": shot["page"],
        "image": f"paper/page-{shot['page']}.png",
        "aspect": page.rect.width / page.rect.height,
        "rect": rect,
        "lines": [norm_rect(r, page) for r in lines] if shot.get("highlight") else [],
        "highlight": bool(shot.get("highlight")),
        "cue": shot.get("cue"),
        "zoom": shot.get("zoom", 1.0),  # >1 crops in past "fit" (wide figures on a tall screen)
        "pan": bool(shot.get("pan")),  # sweep left→right across the rect during the shot
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--zoom", type=float, default=3.0, help="render scale (3 = 216 dpi)")
    args = ap.parse_args()

    spec = json.loads((ROOT / "scenes.json").read_text())
    gen = ROOT / "src" / "generated" / "paper.json"
    gen.parent.mkdir(parents=True, exist_ok=True)
    if not any(s["type"] == "PaperZoom" for s in spec["scenes"]):
        gen.write_text("{}")
        print("no PaperZoom scenes; wrote empty src/generated/paper.json")
        return
    src = ROOT / spec.get("source", "")
    if not src.is_file():
        sys.exit(f"source PDF not found: {src.name or '(scenes.json has no \"source\")'}. "
                 "Copy the PDF into the project and set scenes.json \"source\", or remove the PaperZoom scenes.")
    doc = pymupdf.open(src)
    out_dir = ROOT / "public" / "paper"
    out_dir.mkdir(parents=True, exist_ok=True)

    result: dict[str, list[dict]] = {}
    pages: set[int] = set()
    for scene in spec["scenes"]:
        if scene["type"] != "PaperZoom":
            continue
        shots = []
        for i, shot in enumerate(scene["props"]["shots"]):
            shots.append(resolve_shot(doc, shot, f"{scene['id']} shot {i}"))
            pages.add(shot["page"])
        result[scene["id"]] = shots

    for n in sorted(pages):
        pix = doc[n - 1].get_pixmap(matrix=pymupdf.Matrix(args.zoom, args.zoom))
        pix.save(out_dir / f"page-{n}.png")
        print(f"rendered page {n} -> public/paper/page-{n}.png ({pix.width}x{pix.height})")

    gen.write_text(json.dumps(result, indent=2))
    print(f"wrote {gen.relative_to(ROOT)} ({sum(len(v) for v in result.values())} shots)")


if __name__ == "__main__":
    main()
