#!/usr/bin/env python3
"""
optimize_images.py — converts your site photos to WebP and scales them down.

WHERE TO RUN THIS:
    Put this file inside your "docs" folder (the one containing "files/",
    right next to index.html), then from a terminal:

        cd path/to/docs
        python3 optimize_images.py

REQUIREMENTS:
    pip3 install Pillow

WHAT IT DOES — three passes:

  1. About-page mood-board photos (files/about/**)
       -> files/about-desktop/**  (WebP, capped at 480px, for desktop screens)
       -> files/about-mobile/**   (WebP, capped at 240px, for phone screens)
     These are small decorative grid tiles, so they can be compressed hard
     without anyone noticing.

  2. Your own art — originals + mockups (files/originals/**)
       -> new .webp files written ALONGSIDE the originals in the same folder
          (files/originals/hawks1.jpg stays; files/originals/hawks1.webp is
          added next to it)
     Capped at 2000px on the long edge and a higher quality setting, since
     these are the actual product photos people will look closely at.

NOTHING IS DELETED. Your original .jpg/.png files are left exactly where
they are — this script only adds new, smaller .webp copies. Once you've
checked the results look good, you can remove the old originals yourself
whenever you're ready.

Re-running this script is safe — it just re-generates the .webp files.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit(
        "Pillow isn't installed. Run this first, then try again:\n"
        "    pip3 install Pillow"
    )

ROOT = Path(__file__).resolve().parent

SRC_ABOUT = ROOT / "files" / "about"
DST_ABOUT_DESKTOP = ROOT / "files" / "about-desktop"
DST_ABOUT_MOBILE = ROOT / "files" / "about-mobile"
ABOUT_DESKTOP_MAX = 480
ABOUT_MOBILE_MAX = 240
ABOUT_QUALITY = 78

SRC_ORIGINALS = ROOT / "files" / "originals"
ART_MAX = 2000
ART_QUALITY = 88

IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"}


def convert_one(src_path: Path, dst_path: Path, max_dim: int, quality: int) -> None:
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as im:
        if im.mode in ("P", "CMYK"):
            im = im.convert("RGBA" if "transparency" in im.info else "RGB")
        elif im.mode not in ("RGB", "RGBA", "L"):
            im = im.convert("RGB")

        w, h = im.size
        scale = min(1.0, max_dim / max(w, h))
        if scale < 1.0:
            new_size = (max(1, round(w * scale)), max(1, round(h * scale)))
            im = im.resize(new_size, Image.LANCZOS)

        im.save(dst_path, "WEBP", quality=quality, method=6)


def process_tree(src_root: Path, dst_root: Path, max_dim: int, quality: int, label: str) -> None:
    if not src_root.exists():
        print(f"  (skipping {label} — {src_root} not found)")
        return

    files = [p for p in src_root.rglob("*") if p.is_file() and p.suffix in IMG_EXTS]
    if not files:
        print(f"  (no images found for {label} in {src_root})")
        return

    total_before = total_after = 0
    ok = failed = 0

    for path in files:
        rel = path.relative_to(src_root)
        dst = (dst_root / rel).with_suffix(".webp")
        try:
            before = path.stat().st_size
            convert_one(path, dst, max_dim, quality)
            after = dst.stat().st_size
            total_before += before
            total_after += after
            ok += 1
        except Exception as e:
            print(f"    !! failed: {rel}  ({e})")
            failed += 1

    saved_pct = 100 * (1 - total_after / total_before) if total_before else 0
    print(f"  {label}: {ok} converted" + (f", {failed} failed" if failed else ""))
    print(f"    {total_before/1024/1024:.1f} MB -> {total_after/1024/1024:.1f} MB "
          f"({saved_pct:.0f}% smaller)  ->  {dst_root}")


def main():
    print("Converting About-page mood-board photos...")
    process_tree(SRC_ABOUT, DST_ABOUT_DESKTOP, ABOUT_DESKTOP_MAX, ABOUT_QUALITY, "About (desktop)")
    process_tree(SRC_ABOUT, DST_ABOUT_MOBILE, ABOUT_MOBILE_MAX, ABOUT_QUALITY, "About (mobile)")

    print("\nConverting your own art (originals + mockups)...")
    process_tree(SRC_ORIGINALS, SRC_ORIGINALS, ART_MAX, ART_QUALITY, "Originals")

    print("\nDone. Original files are untouched — new .webp files sit alongside them.")


if __name__ == "__main__":
    main()
