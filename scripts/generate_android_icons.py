#!/usr/bin/env python3

from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw


def _draw_star(draw: ImageDraw.ImageDraw, cx: float, cy: float, outer: float, inner: float, fill):
    points = []
    for index in range(8):
        angle = -math.pi / 2 + index * (math.pi / 4)
        radius = outer if index % 2 == 0 else inner
        points.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    draw.polygon(points, fill=fill)


def _rounded_box(x: float, y: float, size: float) -> tuple[int, int, int, int]:
    left = int(round(x))
    top = int(round(y))
    side = max(8, int(round(size)))
    return (left, top, left + side, top + side)


def _draw_marker_square(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    size: float,
    fill: str,
):
    box = _rounded_box(x, y, size)
    side = min(box[2] - box[0], box[3] - box[1])
    radius = max(2, min(side // 3, side // 2))
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def build_icon(size: int, circular: bool = False) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    margin = size * 0.08
    radius = int(size * 0.22)
    bg_box = (margin, margin, size - margin, size - margin)
    draw.rounded_rectangle(bg_box, radius=radius, fill="#0d0d0d")

    border_margin = size * 0.12
    border_box = (
        border_margin,
        border_margin,
        size - border_margin,
        size - border_margin,
    )
    draw.rounded_rectangle(
        border_box,
        radius=int(size * 0.18),
        outline="#1e1e1e",
        width=max(2, size // 32),
    )

    purple = "#7c3aed"
    stroke = max(4, size // 11)
    draw.arc(
        (
            size * 0.26,
            size * 0.24,
            size * 0.78,
            size * 0.56,
        ),
        start=192,
        end=12,
        fill=purple,
        width=stroke,
    )
    draw.arc(
        (
            size * 0.22,
            size * 0.50,
            size * 0.72,
            size * 0.82,
        ),
        start=12,
        end=192,
        fill=purple,
        width=stroke,
    )

    _draw_star(
        draw,
        size * 0.28,
        size * 0.32,
        size * 0.10,
        size * 0.045,
        "#60a5fa",
    )

    _draw_marker_square(draw, size * 0.66, size * 0.66, size * 0.12, "#f5f5f5")

    if circular:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
        result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        result.paste(image, (0, 0), mask)
        return result

    return image


def build_foreground(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    purple = "#7c3aed"
    stroke = max(4, size // 10)

    draw.arc(
        (
            size * 0.22,
            size * 0.20,
            size * 0.80,
            size * 0.54,
        ),
        start=194,
        end=12,
        fill=purple,
        width=stroke,
    )
    draw.arc(
        (
            size * 0.19,
            size * 0.49,
            size * 0.74,
            size * 0.84,
        ),
        start=12,
        end=194,
        fill=purple,
        width=stroke,
    )

    _draw_star(
        draw,
        size * 0.26,
        size * 0.28,
        size * 0.11,
        size * 0.05,
        "#60a5fa",
    )

    _draw_marker_square(draw, size * 0.66, size * 0.67, size * 0.13, "#f5f5f5")

    return image


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: generate_android_icons.py <android-res-dir>", file=sys.stderr)
        return 1

    res_dir = Path(sys.argv[1])
    densities = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192,
    }

    for density, size in densities.items():
        mipmap_dir = res_dir / f"mipmap-{density}"
        mipmap_dir.mkdir(parents=True, exist_ok=True)
        build_icon(size).save(mipmap_dir / "ic_launcher.png")
        build_icon(size, circular=True).save(mipmap_dir / "ic_launcher_round.png")
        build_foreground(size).save(mipmap_dir / "ic_launcher_foreground.png")

    colors_path = res_dir / "values" / "colors.xml"
    colors_path.parent.mkdir(parents=True, exist_ok=True)
    colors_path.write_text(
        """<resources>
    <color name="ic_launcher_background">#0d0d0d</color>
</resources>
""",
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
