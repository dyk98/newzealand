#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import zipfile
from pathlib import Path

from docx import Document


def normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def paragraph_to_markdown(style_name: str, text: str) -> str:
    if not text:
        return ""

    if style_name == "Title":
        return f"# {text}"
    if style_name == "Heading 1":
        return f"# {text}"
    if style_name == "Heading 2":
        return f"## {text}"
    if style_name == "Heading 3":
        return f"### {text}"
    if style_name == "Heading 4":
        return f"#### {text}"

    if text.startswith(("●", "", "- ")):
        stripped = text.lstrip("●- ").strip()
        return f"- {stripped}"

    if re.match(r"^\d+\.\s+", text):
        return text

    return text


def extract_media(docx_path: Path, media_dir: Path) -> list[str]:
    if media_dir.exists():
        shutil.rmtree(media_dir)
    media_dir.mkdir(parents=True, exist_ok=True)

    extracted: list[str] = []
    with zipfile.ZipFile(docx_path) as archive:
        for name in archive.namelist():
            if not name.startswith("word/media/"):
                continue
            if name.endswith("/"):
                continue
            filename = Path(name).name
            target = media_dir / filename
            with archive.open(name) as source, target.open("wb") as dest:
                shutil.copyfileobj(source, dest)
            extracted.append(filename)
    return extracted


def convert(docx_path: Path, markdown_path: Path, media_dir: Path) -> None:
    doc = Document(docx_path)
    media_files = extract_media(docx_path, media_dir)

    lines: list[str] = []
    for paragraph in doc.paragraphs:
        text = normalize_text(paragraph.text)
        md = paragraph_to_markdown(paragraph.style.name, text)
        if not md:
            if lines and lines[-1] != "":
                lines.append("")
            continue

        if md.startswith("#") and lines and lines[-1] != "":
            lines.append("")
        lines.append(md)

    if media_files:
        lines.append("")
        lines.append("# 文档图片资源")
        lines.append("")
        lines.append("以下图片从 Word 文档中抽取，页面实现时可按需要重新归类到对应日期或景点。")
        lines.append("")
        for filename in media_files:
            lines.append(f"![{filename}](/itinerary-media/{filename})")
            lines.append("")

    markdown_path.parent.mkdir(parents=True, exist_ok=True)
    markdown_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert a DOCX itinerary to Markdown.")
    parser.add_argument("docx", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--media-dir", type=Path, required=True)
    args = parser.parse_args()

    convert(args.docx, args.out, args.media_dir)


if __name__ == "__main__":
    main()
