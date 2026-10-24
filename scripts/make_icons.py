#!/usr/bin/env python3
"""Fallback launcher-icon / splash generator.

Used only when `@capacitor/assets` is not available in the build environment.
It writes plain square launcher icons for every density (removing the
adaptive-icon XML so the PNGs are used on every Android version) and
centre-crops resources/splash.png into every splash slot of the template.
"""
import glob
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON_SRC = os.path.join(ROOT, "resources", "icon.png")
SPLASH_SRC = os.path.join(ROOT, "resources", "splash.png")
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def centre_crop(img, w, h):
    """Crop `img` to the w:h aspect ratio, keeping the middle."""
    sw, sh = img.size
    target = w / float(h)
    if sw / float(sh) > target:          # too wide -> cut the sides
        new_w = int(round(sh * target))
        left = (sw - new_w) // 2
        img = img.crop((left, 0, left + new_w, sh))
    else:                                # too tall -> cut top/bottom
        new_h = int(round(sw / target))
        top = (sh - new_h) // 2
        img = img.crop((0, top, sw, top + new_h))
    return img.resize((w, h), Image.LANCZOS)


def main():
    if not os.path.exists(ICON_SRC):
        sys.exit("resources/icon.png not found")
    if not os.path.exists(RES):
        sys.exit("android project not found - run `npx cap add android` first")

    # --- launcher icons -------------------------------------------------
    anydpi = os.path.join(RES, "mipmap-anydpi-v26")
    if os.path.isdir(anydpi):
        shutil.rmtree(anydpi)

    icon = Image.open(ICON_SRC).convert("RGBA")
    for folder, size in DENSITIES.items():
        out_dir = os.path.join(RES, folder)
        os.makedirs(out_dir, exist_ok=True)
        resized = icon.resize((size, size), Image.LANCZOS)
        for name in ("ic_launcher.png", "ic_launcher_round.png"):
            resized.save(os.path.join(out_dir, name))
        print("icon  ->", folder, size)

    # --- splash screens -------------------------------------------------
    if os.path.exists(SPLASH_SRC):
        splash = Image.open(SPLASH_SRC).convert("RGB")
        for path in sorted(glob.glob(os.path.join(RES, "drawable*", "splash.png"))):
            with Image.open(path) as probe:
                w, h = probe.size
            centre_crop(splash, w, h).save(path)
            print("splash->", os.path.relpath(path, RES), w, h)


if __name__ == "__main__":
    main()
