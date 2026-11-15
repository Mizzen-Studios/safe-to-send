# VM → Pixel wireless debugging plan

Status: **VM_ADB_READY / PHYSICAL_NOT_RUN** — 15 November 2026. Owner authorized compatible VM tooling at 18:47 UTC. Native ARM64 adb is now usable; the remote phone path remains **not proven to work**. No pairing, connection, phone operation, phone installation or network changes were performed. Physical authorization remains a separate future user decision.

## Official evidence and limits

- [Android Debug Bridge (adb)](https://developer.android.com/tools/adb) documents Android 11+ wireless debugging with Wi-Fi and pairing. Fetching this page hit a redirect limit here; the directly retrieved official AOSP references below establish the verified technical details. Keep the Pixel on Wi-Fi: a Tailscale VPN is not evidence that Android's Wi-Fi/debugging prerequisite is met. The documented same-network workflow is not a promise of remote VPN support.
- [Architecture of ADB Wifi](https://android.googlesource.com/platform/packages/modules/adb/+/refs/heads/main/docs/dev/adb_wifi.md) (HTTP 200) describes TLS pairing without USB, a pairing-code endpoint shown with the Wi-Fi address, and a **separate randomly selected TLS connection port**. Pairing-dialog and main Wireless debugging ports are not interchangeable. Re-read both after toggling debugging or changing Wi-Fi; never hard-code them.
- [AOSP adb_wifi.cpp](https://android.googlesource.com/platform/packages/modules/adb/+/refs/heads/main/daemon/adb_wifi.cpp) (HTTP 200) uses network_inaddr_any_server(port_, SOCK_STREAM, &err) for its TLS server. Therefore “always bound only to Wi-Fi” is too strong. However, upstream wildcard listening does **not** prove the installed Pixel's pairing listener, Android VPN userspace forwarding or firewall accepts traffic addressed to its Tailscale IP. The UI advertises Wi-Fi, not a guaranteed VPN endpoint. Both pairing and post-pair TLS reachability require physical tests.
- AOSP advertises _adb-tls-pairing._tcp and _adb-tls-connect._tcp via mDNS. Do not expect link-local mDNS discovery across the routed tailnet; use explicit IP:port. MagicDNS name resolution is not mDNS service discovery. The VM interface's MULTICAST flag does not prove tailnet multicast transport.
- [Install Tailscale on Android](https://tailscale.com/docs/install/android) (HTTP 200) describes the app/VPN configuration. [Other VPNs](https://tailscale.com/docs/reference/faq/other-vpns) (HTTP 200) says Android supports only one active VPN. Other VPNs, app exclusions, exit-node settings and Android local-service handling may affect this proposal; none were inspected on the phone.
- [Access control lists](https://tailscale.com/docs/features/access-control/acls) (HTTP 200): policy is directional. Membership alone does not prove VM → phone TCP permission. Default allow-all exists in some configurations, so assume neither allow nor deny for this actual tailnet. Need narrowly scoped permission for the two current ports, not broad access to solve discovery.
- [Using Tailscale with your firewall](https://tailscale.com/docs/integrations/firewalls) (HTTP 200): NAT traversal can use a relay. Overlay ping is not proof an Android TCP service accepts connections. Host/Android firewalls, endpoint binding, policy, Wi-Fi isolation, VPN forwarding and path MTU remain separate hypotheses. [Site-to-site](https://tailscale.com/docs/features/site-to-site) discusses MTU/MSS for routed scenarios; it does not justify blindly changing this host's MTU or firewall.

## VM-only observations — tested, not phone proof

- Host: Ubuntu 24.04 / aarch64. Existing SDK adb remains an **x86-64 ELF**, requiring the absent /lib64/ld-linux-x86-64.so.2. It was preserved unchanged. Compatible Ubuntu ARM64 packages were downloaded and extracted without sudo or system installation; see [verified VM tooling](VM_ARM64_ADB_PREP.md) for exact paths, hashes, provenance and tests. **ADB CLI readiness PASS**: genuine version 1.0.41 / 34.0.4-debian, dependencies resolved, dedicated server observed only on 127.0.0.1:15037, devices list empty. This proves client/loopback operation, not remote TLS pairing or reachability.
- tailscale version: **1.104.5**. Existing tailscale0 is UP/LOWER_UP, MTU **1280**. Policy routes include table 52; eight route destinations observed and omitted. This establishes local interface/routing presence only, not phone enrollment, connectivity, ACL permission or ADB reachability.
- No peer list, phone address, serial, pairing code, token or private network address is recorded here. No phone-targeted ping or port probe was run. Only the isolated loopback adb server and empty devices list were tested.

## Bounded future runbook — NOT_RUN

1. **Stop for explicit physical-device authorization.** An authorized operator must control the phone UI; this is not an assumed owner test/recording task. VM tooling is ready using the explicit native path below; no Mac is needed. No phone installation or host/network changes are authorized by this plan.
2. Operator confirms Android version, Wi-Fi, Tailscale connected to the intended tailnet, no conflicting VPN and expected phone identity. Keep addresses and the short-lived pairing code private.
3. Enable Developer options → Wireless debugging → **Pair device with pairing code**. Privately provide the current pairing port and intended phone tailnet address. Inspect relevant policy before testing; no policy edits authorized. If Wi-Fi/debugging disables itself, stop and re-read settings, not bypass them.
4. With authorized working adb and a private interactive terminal, use these **templates**, not executed commands. Enter the code only at adb's prompt using private input that is not captured in logs. If tooling cannot protect it, stop. Never append the code to command arguments.

   ~~~sh
   export LD_LIBRARY_PATH=/home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root/usr/lib/aarch64-linux-gnu/android
   export ADB_MDNS_AUTO_CONNECT=0 ADB_MDNS=0 ADB_USB=0
   ADB=/home/ubuntu/.openclaw/workspace/.openclaw/tools/adb-arm64/root/usr/bin/adb
   "$ADB" -P 15037 pair <PHONE_TAILNET_IP>:<PAIRING_PORT>
   # Enter code privately at prompt, never above.
   "$ADB" -P 15037 connect <PHONE_TAILNET_IP>:<CURRENT_TLS_CONNECT_PORT>
   "$ADB" -P 15037 devices -l
   ~~~

   Read the connection port from the main Wireless debugging page, not the pairing dialog. Pair success is not connect success. Capture sanitized status only: pair/connect result and authorized device present/absent. Verify intended device identity before subsequent commands; installation, inference and recording require their own authorized task.
5. Timeout/refusal: classify bad port, closed pairing dialog, policy, listener/VPN forwarding or transport; do not scan, automatically retry or broaden permissions. Authorized Tailscale ping diagnoses overlay connectivity only, not TCP listener access. If large transfers stall, investigate path MTU; local 1280 does not prove the whole path. No MTU edits proposed.
6. If direct tailnet access fails, report **NOT_REACHABLE / CAUSE_UNCONFIRMED**. A separately authorized trusted LAN host/subnet route or later USB may be alternatives, not actions here. No root, Android security bypass, multicast bridge, public exposure, router forwarding, firewall/App Check disablement or legacy **adb tcpip 5555**. AOSP explicitly calls that legacy channel unencrypted.
7. At session end, disconnect the specific endpoint; operator disables Wireless debugging and forgets host pairing if no longer needed. Never kill shared adb servers or alter unrelated sessions. Preserve sanitized evidence only; no pairing codes in chat, screenshots, recordings or commits.

**Decision:** plausible bounded experiment, **not a confirmed VM-to-Pixel solution**. Remaining gates: authorized physical session, phone-side setup, unknown phone listener/VPN reachability and policy. VM adb incompatibility is resolved. Do not infer physical inference or footage from this document.

## Only remaining phone-side preparation — instructions, NOT performed

- Confirm the Pixel runs Android 11 or newer, keep it on Wi-Fi and unlock it.
- If not already present, install Tailscale on the Pixel **only when separately authorized**, sign in to the same intended tailnet as the VM and connect its VPN. No installation was done here. Android normally allows one active VPN; report conflicts rather than changing security settings blindly.
- Enable Developer options (About phone → Build number seven taps, authenticate locally), then Settings → System → Developer options → Wireless debugging. Accept only the intended Wi-Fi network.
- Open **Pair device with pairing code**. Keep that dialog open. Through the owner's private interface only, provide the current short-lived pairing code, pairing port and intended phone Tailscale address to the authorized operator. Do not post codes in shared chat or record them.
- After pairing, return to the main Wireless debugging page and privately provide its **different TLS connection port**. Ports can change; read both afresh. The operator handles VM commands; the owner is not being asked to install developer tools or run tests on another computer.
- Phone Wi-Fi address shown by Android is not the intended tailnet address. Explicit tailnet IP plus each current port is required; do not rely on cross-tailnet mDNS. Phone enrollment, policy permission and listener routing still need authorized verification. AOSP wildcard binding does not guarantee Pixel VPN forwarding.
- If this fails, stop and report the observed error. No public port 5555, legacy tcpip, root/bootloader changes, ACL/firewall/routes edits or phone installation/inference/recording is authorized here.
