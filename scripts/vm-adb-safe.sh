#!/bin/sh
# VM-only preflight: deliberately cannot pair, connect, or run device commands.
set -eu
if [ "$#" -ne 1 ]; then echo 'Usage: vm-adb-safe.sh version|help|start-server|devices' >&2; exit 64; fi
case "$1" in version|help|start-server|devices) ;; *) echo 'Blocked: physical-device commands require separate authorization.' >&2; exit 64;; esac
ROOT=/home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root
# No inherited device target, remote server, tracing, vendor keys or auto-connect.
unset ANDROID_SERIAL ANDROID_ADB_SERVER_PORT ANDROID_ADB_SERVER_ADDRESS ADB_SERVER_SOCKET ADB_TRACE ADB_VENDOR_KEYS ADB_SERVER_PORT ADB_SERVER_ADDRESS
export LD_LIBRARY_PATH="$ROOT/usr/lib/aarch64-linux-gnu/android"
export ADB_MDNS_AUTO_CONNECT=0
export ADB_MDNS=0
export ADB_LIBUSB=0
export ADB_USB=0
export ANDROID_USER_HOME=/home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/state
exec "$ROOT/usr/bin/adb" -P 15037 "$1"
