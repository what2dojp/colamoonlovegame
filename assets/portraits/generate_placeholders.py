#!/usr/bin/env python3
"""Transparent RGBA PNG portrait placeholders. Replace with official cutouts later."""
from __future__ import annotations

import os
import struct
import zlib

OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 280, 460


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: str, pixels: bytearray) -> None:
    raw = b"".join(b"\x00" + bytes(pixels[y * W * 4 : (y + 1) * W * 4]) for y in range(H))
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as handle:
        handle.write(png)


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def blend(px: bytearray, x: int, y: int, r: int, g: int, b: int, a: int) -> None:
    if a <= 0 or x < 0 or y < 0 or x >= W or y >= H:
        return
    i = (y * W + x) * 4
    oa = px[i + 3]
    if oa == 0:
        px[i : i + 4] = bytes((r, g, b, a))
        return
    na = a + oa * (255 - a) // 255
    if na == 0:
        return
    px[i] = (r * a + px[i] * oa * (255 - a) // 255) // na
    px[i + 1] = (g * a + px[i + 1] * oa * (255 - a) // 255) // na
    px[i + 2] = (b * a + px[i + 2] * oa * (255 - a) // 255) // na
    px[i + 3] = na


def ellipse(px: bytearray, cx: float, cy: float, rx: float, ry: float, color: tuple[int, int, int], alpha: int = 230) -> None:
    r, g, b = color
    x0, x1 = max(0, int(cx - rx)), min(W - 1, int(cx + rx))
    y0, y1 = max(0, int(cy - ry)), min(H - 1, int(cy + ry))
    rx2 = max(rx * rx, 0.01)
    ry2 = max(ry * ry, 0.01)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if ((x - cx) ** 2) / rx2 + ((y - cy) ** 2) / ry2 <= 1:
                blend(px, x, y, r, g, b, alpha)


def figure(px: bytearray, accent: str, hair: str) -> None:
    body = hex_rgb(accent)
    hair_c = hex_rgb(hair)
    skin = (255, 226, 214)
    # hair mass
    ellipse(px, 150, 118, 78, 92, hair_c, 235)
    # head
    ellipse(px, 148, 128, 48, 58, skin, 240)
    # bangs
    ellipse(px, 148, 86, 54, 28, hair_c, 235)
    # torso
    ellipse(px, 150, 270, 70, 110, body, 220)
    # skirt / lower
    ellipse(px, 150, 370, 78, 86, body, 200)
    # arms
    ellipse(px, 78, 268, 22, 70, body, 210)
    ellipse(px, 222, 268, 22, 70, body, 210)


def dog_ears(px: bytearray, color: tuple[int, int, int]) -> None:
    ellipse(px, 96, 62, 22, 38, color, 230)
    ellipse(px, 204, 62, 22, 38, color, 230)


CHARACTERS = {
    "nini": ("#ffb36a", "#c47a3a", True),
    "meteor": ("#7cf7ff", "#3aa7b8", False),
    "pepsi": ("#c59bff", "#3b2458", False),
    "jupiter": ("#ffd56a", "#d4a03a", False),
    "mars": ("#ff6a4d", "#8a2418", False),
}

for name, (accent, hair, ears) in CHARACTERS.items():
    pixels = bytearray(W * H * 4)
    figure(pixels, accent, hair)
    if ears:
        dog_ears(pixels, hex_rgb(hair))
    path = os.path.join(OUT, f"{name}.png")
    write_png(path, pixels)
    print("wrote", path)
