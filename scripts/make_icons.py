#!/usr/bin/env python3
"""Fallback launcher-icon generator (used only if @capacitor/assets is unavailable).

Creates plain square launcher icons for every density from resources/icon.png.
It removes the adaptive-icon XML (mipmap-anydpi-v26) so the PNGs are used on
every Android version.
"""
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "resources", "icon.png")
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def main():
    if not os.path.exists(SRC):
        sys.exit("resources/icon.png not found")
    if not os.path.exists(RES):
        sys.exit("android project not found - run `npx cap add android` first")

    anydpi = os.path.join(RES, "mipmap-anydpi-v26")
    if os.path.isdir(anydpi):
        shutil.rmtree(anydpi)

    icon = Image.open(SRC).convert("RGBA")
    for folder, size in DENSITIES.items():
        out_dir = os.path.join(RES, folder)
        os.makedirs(out_dir, exist_ok=True)
        resized = icon.resize((size, size), Image.LANCZOS)
        for name in ("ic_launcher.png", "ic_launcher_round.png"):
            resized.save(os.path.join(out_dir, name))
        print("wrote", folder, size)


if __name__ == "__main__":
    main()
