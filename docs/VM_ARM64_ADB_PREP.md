# Verified native ARM64 adb on this VM

15 November 2026 — **VM_READY / PHYSICAL_NOT_RUN**. VM tooling authorized 18:47 UTC.

## Exact usable paths

- Native binary: /home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root/usr/lib/android-sdk/platform-tools/adb
- Package symlink: /home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root/usr/bin/adb
- Libraries: /home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root/usr/lib/aarch64-linux-gnu/android
- Guarded preflight: /home/ubuntu/.openclaw/workspace/.openclaw/tmp/safe-send-arm64-adb/scripts/vm-adb-safe.sh

Run from this checkout:

~~~sh
scripts/vm-adb-safe.sh version
scripts/vm-adb-safe.sh start-server
scripts/vm-adb-safe.sh devices
~~~

The wrapper permits only those three commands plus help, rejects extra arguments before calling adb, clears inherited target/server/trace settings, disables USB scanning/mDNS auto-connect, and uses isolated port 15037. No -a/all-interface option. It intentionally rejects pair/connect/install/shell/tcpip; future authorized physical work uses the explicit binary and library path in [the phone runbook](VM_PIXEL_WIRELESS_PLAN.md), not a relaxed wrapper.

Important distro behavior: `-L tcp:127.0.0.1:15037` was rejected by the daemon as “listening on specified hostname currently unsupported”; client auto-start also treats that explicit hostname as remote. Use `-P 15037` (default localhost binding). Actual ss inspection confirmed **127.0.0.1:15037**, not a wildcard. The preliminary foreground daemon aborted; it is not left running. No pre-existing adb/emulator listener/session was present or killed. The dedicated server is nonpersistent and can exit when its tool process environment is reaped; the wrapper starts it again safely. Never kill another server to solve a port conflict.

## Genuine runtime evidence

- ELF64 ARM aarch64, interpreter /lib/ld-linux-aarch64.so.1; ldd resolves every dependency.
- adb version: **Android Debug Bridge 1.0.41 / 34.0.4-debian**.
- SHA256 of actual binary: **9c4c531f3f4bd9a9edf608b99803e65fb111e4198743345c76ae9a416035674b**.
- start-server succeeded; devices output was only “List of devices attached” and a blank line. ss confirmed the dedicated IPv4 loopback TCP listener; no adb UDP listener was observed.
- Pair command exists in help and packaged BoringSSL dependencies resolve. This is client capability evidence only: **no TLS handshake/pair/connect, phone ping, remote port probe, inference or footage**.
- Shell syntax and offline fake-adb tripwire test pass: four allowed commands; eleven invalid/device/extra-argument cases rejected without invoking the fake executable. Run `node --test scripts/vm-adb-safe.test.mjs`. The test never invokes genuine adb or a phone.

## Package provenance and non-system extraction

No sudo, apt install, loader workaround, SDK replacement, Mac tools, billing, deploy or network changes. apt-get download and dpkg-deb -x extracted six Ubuntu noble/universe **arm64** packages under the workspace tool directory. Existing /home/ubuntu/Android/Sdk/platform-tools/adb was not overwritten. No deb/ELF/key material is committed.

Trust was checked end-to-end, not just a self-computed download hash:

1. gpgv using /usr/share/keyrings/ubuntu-archive-keyring.gpg verified the locally cached Ubuntu noble InRelease, signed by Ubuntu Archive Automatic Signing Key (2018), fingerprint F6ECB3762474EDA9D21B7022871920D1991BC93C.
2. Uncompressed universe/binary-arm64/Packages is 72,105,605 bytes; SHA256 adb1c01115c3b11d2a5cde43b17ce3c53fa7cc48f834b930f63910d2c7dc74f5 matches its signed InRelease entry exactly.
3. Every downloaded deb's package name, version, arm64 architecture and SHA256 matched its entry in that authenticated Packages index. See [sanitized machine-readable provenance](VM_ARM64_ADB_PROVENANCE.json).

Packages: adb, android-libbase, android-libcutils, android-liblog, android-libziparchive **1:34.0.4-1build3**; android-libboringssl **14.0.0+r11-4build1**. Downloads used configured Ubuntu ports archive, with normal APT authentication (no insecure/trusted override). The noble release InRelease dates to April 2024: verified archive provenance is **not** a claim this older distribution build is current upstream or independently security-audited. Existing system libraries supply non-Android dependencies; ldd evidence and full package metadata remain locally under .openclaw/tools/adb-arm64/evidence/.

Only phone-side preparation and separately authorized physical reachability/pairing remain; no VM-to-Pixel success is claimed. See the linked runbook for plain phone actions and private code handling.
