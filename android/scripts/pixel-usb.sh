#!/bin/bash
# macOS Bash 3.2 compatible. No UI automation, debug secrets, or network adb.
set -euo pipefail
umask 077
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 2; }
usage() {
  echo 'Usage: pixel-usb.sh --serial USB_SERIAL doctor|install APK SHA256|record|pull REMOTE_BASENAME OUTDIR|cleanup REMOTE_BASENAME|availability|evaluate'
}
[ "${1:-}" = '--serial' ] || { usage >&2; fail 'Explicit --serial is required'; }
[ "$#" -ge 3 ] || fail 'Serial and subcommand required'
serial=$2; shift 2
case "$serial" in ''|*[!A-Za-z0-9_-]*|emulator-*) fail 'Physical USB serial required (no TCP/IP/emulator serial)' ;; esac
cmd=$1; shift
remote_name() {
  case "$1" in safe-to-send-????????T??????Z-*.mp4) ;; *) fail 'Not a helper-owned recording basename' ;; esac
  [[ "$1" =~ ^safe-to-send-[0-9]{8}T[0-9]{6}Z-[0-9]+[.]mp4$ ]] || fail 'Unsafe remote basename'
}
hash_file() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | awk '{print $1}';
  elif command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}';
  else fail 'SHA-256 tool unavailable'; fi
}
# Validate all paths/arguments before adb can be invoked.
case "$cmd" in
  doctor|record|availability|evaluate) [ "$#" -eq 0 ] || fail 'Unexpected arguments' ;;
  install)
    [ "$#" -eq 2 ] || fail 'install requires APK path and independently obtained SHA256'
    apk=$1; expected=$2
    case "$apk" in /*.apk) ;; *) fail 'APK must be an absolute .apk path' ;; esac
    [ -f "$apk" ] && [ ! -L "$apk" ] || fail 'APK must be a regular non-symlink file'
    [[ "$expected" =~ ^[0-9a-fA-F]{64}$ ]] || fail 'Invalid SHA256'
    actual=$(hash_file "$apk")
    [ "$actual" = "$(printf '%s' "$expected" | tr 'A-F' 'a-f')" ] || fail 'APK hash mismatch'
    ;;
  pull)
    [ "$#" -eq 2 ] || fail 'pull requires remote basename and existing output directory'
    remote_name "$1"
    case "$2" in /*) ;; *) fail 'Output directory must be absolute' ;; esac
    [ -d "$2" ] && [ ! -L "$2" ] || fail 'Output directory must exist and not be symlink'
    out=$(cd "$2" && pwd -P)
    [ "$out" != '/' ] || fail 'Root output directory forbidden'
    [ ! -e "$out/$1" ] && [ ! -L "$out/$1" ] || fail 'Refusing to overwrite output'
    ;;
  cleanup) [ "$#" -eq 1 ] || fail 'cleanup requires one exact remote basename'; remote_name "$1" ;;
  *) usage >&2; fail 'Unknown command' ;;
esac
# Unit-test mode only validates arguments; never executes adb, never implies device success.
if [ "${TEST_ONLY:-0}" = 1 ]; then echo 'TEST_ONLY: arguments accepted; NO DEVICE OPERATION'; exit 0; fi
case "$cmd" in availability|evaluate) fail 'UNAVAILABLE: use implemented app UI/export; no adb availability/evaluation interface is defined' ;; esac
command -v adb >/dev/null 2>&1 || fail 'Android platform-tools adb not installed'
adb_usb() { adb -s "$serial" "$@"; }
row=$(adb devices -l | awk -v s="$serial" '$1==s {print}')
[ -n "$row" ] || fail 'Selected serial is not connected'
printf '%s\n' "$row" | grep -Eq '[[:space:]]device[[:space:]]' || fail 'Device unauthorized/offline; private operator authorization required'
printf '%s\n' "$row" | grep -Eq '[[:space:]]usb:' || fail 'Not an explicitly identified USB transport'
[ "$(adb_usb shell getprop ro.kernel.qemu | tr -d '\r\n')" != 1 ] || fail 'Emulator is not Nano attestation evidence'
[ "$(adb_usb shell getprop ro.boot.qemu | tr -d '\r\n')" != 1 ] || fail 'Emulator is not Nano attestation evidence'
case "$cmd" in
  doctor)
    echo 'Physical USB transport checked; NOT Nano inference or production attestation proof.'
    for prop in ro.product.manufacturer ro.product.model ro.build.version.release ro.build.version.sdk; do
      printf '%s: ' "$prop"; adb_usb shell getprop "$prop"
    done
    echo 'Nano availability/download/evaluation: UNAVAILABLE in helper; use actual implemented app UI/export.'
    ;;
  install)
    # aapt must come from installed Android SDK build-tools; no download performed.
    command -v aapt >/dev/null 2>&1 || fail 'aapt required to verify fixed package before install'
    package=$(aapt dump badging "$apk" | sed -n "s/^package: name='\([^']*\)'.*/\1/p")
    [ "$package" = com.mizzen.safetosend ] || fail 'Unexpected APK applicationId'
    echo "Verified APK SHA256: $actual"
    adb_usb install -r "$apk" # preserves data; signature mismatch must stop, never uninstall/wipe
    ;;
  record)
    name="safe-to-send-$(date -u +%Y%m%dT%H%M%SZ)-$$.mp4"
    echo "Recording synthetic app screen only, at most 175s. Remote basename: $name"
    echo 'Stop immediately if personal notifications or secrets become visible; discard unsafe footage privately.'
    adb_usb shell screenrecord --time-limit 175 "/sdcard/$name"
    echo "Recording command finished; pull and inspect before declaring usable footage: $name"
    ;;
  pull)
    adb_usb pull "/sdcard/$1" "$out/$1"
    [ -s "$out/$1" ] || fail 'Empty recording'
    printf 'Local recording SHA256: '; hash_file "$out/$1"
    echo 'Not inspected footage; retain privately until visual and decode checks pass.'
    ;;
  cleanup)
    # Exact helper namespace and basename only; no glob, recursive delete, logcat or app data clear.
    adb_usb shell rm "/sdcard/$1"
    echo 'Requested exact recording removed; no other files touched.'
    ;;
esac
