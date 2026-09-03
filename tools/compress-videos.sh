#!/usr/bin/env bash
# Squeeze the solution videos before they are committed.
#
# The recordings arrive as H.264 already, but with 120 kb/s mono narration —
# nearly half of each file, for speech. Re-encoding the audio does most of the
# work; CRF 30 on the video costs nothing visible because the picture is a white
# worksheet with handwriting appearing on it. Roughly halves each file.
#
# ffmpeg comes from the imageio-ffmpeg package rather than a system install, so
# this needs nothing set up.
#
#   bash tools/compress-videos.sh [dir]        # default public/solutions
set -euo pipefail
DIR="${1:-public/solutions}"
FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

before=0; after=0
for f in "$DIR"/*.mp4; do
  n=$(basename "$f")
  "$FF" -hide_banner -loglevel error -y -i "$f" \
      -c:v libx264 -crf 30 -preset slow -tune stillimage \
      -c:a aac -b:a 64k -ac 1 -movflags +faststart "$TMP/$n" </dev/null

  # A re-encode that dropped the audio or changed the length is not a smaller
  # file, it is a broken one. Check before replacing anything.
  od=$("$FF" -hide_banner -i "$f"       2>&1 | awk -F'[:,]' '/Duration/{print int($2*3600+$3*60+$4)}')
  nd=$("$FF" -hide_banner -i "$TMP/$n"  2>&1 | awk -F'[:,]' '/Duration/{print int($2*3600+$3*60+$4)}')
  na=$("$FF" -hide_banner -i "$TMP/$n"  2>&1 | grep -c 'Audio:' || true)
  if [ ! -s "$TMP/$n" ] || [ "$od" != "$nd" ] || [ "$na" != "1" ]; then
    echo "skipped $n — duration $od->$nd, audio streams $na"
    continue
  fi
  b=$(stat -f%z "$f"); before=$((before+b))
  cp "$TMP/$n" "$f"
  a=$(stat -f%z "$f"); after=$((after+a))
  printf '  %-28s %5d KB -> %5d KB\n' "$n" $((b/1024)) $((a/1024))
done
[ "$before" -gt 0 ] && echo "total: $((before/1024)) KB -> $((after/1024)) KB ($(( 100 - after*100/before ))% smaller)"
