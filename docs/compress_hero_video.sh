#!/usr/bin/env bash
#
# compress_hero_video.sh — compresses your homepage hero video so it loads
# fast, and generates a poster image so something appears instantly while
# the video itself streams in.
#
# WHERE TO RUN THIS:
#   Put this file inside your "docs" folder (next to index.html, alongside
#   "files/"), then from a terminal:
#
#       chmod +x compress_hero_video.sh
#       ./compress_hero_video.sh
#
# REQUIREMENTS:
#   ffmpeg — install with:
#       macOS:   brew install ffmpeg
#       Linux:   sudo apt install ffmpeg
#       Windows: https://ffmpeg.org/download.html (or via winget/choco)
#
# WHAT IT DOES:
#   Takes files/hero-video.mp4 and produces THREE new files, all much
#   smaller than typical straight-off-a-phone footage:
#
#     files/hero-video.webm   — modern, most efficient format (used first
#                                 if the visitor's browser supports it)
#     files/hero-video-optimized.mp4 — H.264 fallback for everyone else
#     files/hero-poster.jpg   — a still frame shown immediately, before the
#                                 video itself has finished loading
#
#   Your original files/hero-video.mp4 is left completely untouched — this
#   only adds new files alongside it. The code changes I've made point at
#   the new optimized versions, with your original as an unused backup.
#
#   Both video outputs: capped at 1920px wide (no reason to ship 4K for a
#   background video that's displayed at whatever size the browser window
#   is), audio stripped entirely (the video is muted anyway, so there's no
#   reason to ship an audio track at all), and "faststart" enabled — this
#   is the single biggest thing for quick playback start, since without it
#   browsers may need to read much more of the file before they can begin
#   playing anything.

set -e

SRC="files/hero-video.mp4"

if [ ! -f "$SRC" ]; then
  echo "Couldn't find $SRC — run this script from inside your 'docs' folder."
  exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
  echo "ffmpeg isn't installed. See the comments at the top of this script"
  echo "for how to install it, then run this again."
  exit 1
fi

echo "Source file:"
ls -lh "$SRC"
echo ""

echo "1/3 — Generating poster image (shown instantly, before the video loads)..."
ffmpeg -y -i "$SRC" -ss 00:00:01 -vframes 1 \
  -vf "scale='min(1920,iw)':-2" \
  -q:v 4 \
  files/hero-poster.jpg -loglevel error
echo "  -> files/hero-poster.jpg"

echo ""
echo "2/3 — Encoding H.264 MP4 (compatible fallback)..."
ffmpeg -y -i "$SRC" \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 -crf 27 -preset slow \
  -an \
  -movflags +faststart \
  files/hero-video-optimized.mp4 -loglevel error
echo "  -> files/hero-video-optimized.mp4"

echo ""
echo "3/3 — Encoding WebM/VP9 (smaller, used first where supported)..."
ffmpeg -y -i "$SRC" \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 \
  -an \
  files/hero-video.webm -loglevel error
echo "  -> files/hero-video.webm"

echo ""
echo "Done! Size comparison:"
ls -lh "$SRC" files/hero-video-optimized.mp4 files/hero-video.webm files/hero-poster.jpg
