#!/bin/bash
# No device operations: tripwire adb shadows any installed binary.
set -euo pipefail
umask 077
here=$(cd "$(dirname "$0")" && pwd -P)
root=$(cd "$here/../.." && pwd -P)
mkdir -p "$root/.openclaw/tmp"
tmp=$(mktemp -d "$root/.openclaw/tmp/pixel-guards.XXXXXXXX")
# Retain only tiny isolated test fixtures; no broad cleanup/deletes.
mkdir -p "$tmp/bin" "$tmp/output with spaces"
printf '#!/bin/bash\necho TRIPWIRE_ADB_CALLED >&2\nexit 99\n' > "$tmp/bin/adb"
chmod +x "$tmp/bin/adb"
export PATH="$tmp/bin:$PATH"
export TEST_ONLY=1
count=0
expect() {
  want=$1; shift
  set +e
  result=$(bash "$here/pixel-usb.sh" "$@" 2>&1)
  got=$?
  set -e
  [ "$got" = "$want" ] || { printf 'FAIL expected %s got %s: %s\n' "$want" "$got" "$result"; exit 1; }
  case "$result" in *TRIPWIRE*) echo 'FAIL: adb invoked'; exit 1 ;; esac
  count=$((count + 1))
}
bash -n "$here/pixel-usb.sh"
bash -n "$here/test-pixel-usb.sh"
expect 2
expect 2 --serial
expect 2 --serial '' doctor
expect 2 --serial emulator-5554 doctor
expect 2 --serial '192.0.2.1:5555' doctor
expect 2 --serial 'a;echo_bad' doctor
expect 0 --serial SYNTHETIC_USB doctor
expect 0 --serial SYNTHETIC_USB record
expect 2 --serial SYNTHETIC_USB doctor extra
expect 2 --serial SYNTHETIC_USB nonsense
expect 2 --serial SYNTHETIC_USB cleanup /sdcard/other.mp4
expect 2 --serial SYNTHETIC_USB cleanup 'safe-to-send-20261113T010000Z-1.mp4;id'
expect 2 --serial SYNTHETIC_USB cleanup 'safe-to-send-20261113T010000Z-../../1.mp4'
name=safe-to-send-20261113T010000Z-123.mp4
expect 0 --serial SYNTHETIC_USB cleanup "$name"
expect 0 --serial SYNTHETIC_USB pull "$name" "$tmp/output with spaces"
expect 2 --serial SYNTHETIC_USB pull "$name" /
expect 2 --serial SYNTHETIC_USB pull "$name" relative
printf synthetic > "$tmp/output with spaces/$name"
expect 2 --serial SYNTHETIC_USB pull "$name" "$tmp/output with spaces"
ln -s "$tmp/output with spaces" "$tmp/link"
expect 2 --serial SYNTHETIC_USB pull "$name" "$tmp/link"
printf synthetic-apk > "$tmp/app with spaces.apk"
hash=$(shasum -a 256 "$tmp/app with spaces.apk" | awk '{print $1}')
expect 0 --serial SYNTHETIC_USB install "$tmp/app with spaces.apk" "$hash"
expect 2 --serial SYNTHETIC_USB install "$tmp/app with spaces.apk" "$(printf '%064d' 0)"
expect 2 --serial SYNTHETIC_USB install relative.apk "$hash"
expect 2 --serial SYNTHETIC_USB install "$tmp/app with spaces.apk" invalid
ln -s "$tmp/app with spaces.apk" "$tmp/link.apk"
expect 2 --serial SYNTHETIC_USB install "$tmp/link.apk" "$hash"
# Unimplemented interfaces must fail before adb, even outside TEST_ONLY.
TEST_ONLY=0 expect 2 --serial SYNTHETIC_USB availability
case "$result" in *UNAVAILABLE*) ;; *) echo 'Missing unavailable status'; exit 1 ;; esac
TEST_ONLY=0 expect 2 --serial SYNTHETIC_USB evaluate
printf 'PASS: bash syntax + %s offline guard cases; ZERO adb/device operations.\n' "$count"
echo 'Mac Bash 3.2/runtime USB behavior NOT_RUN on this Linux host.'
