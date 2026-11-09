# SDK feasibility audit — 9 November 2026

Independent source/doc review, separate from implementation. Firebase 13.2.0 / @firebase/ai 3.0.0.

- Official documentation and installed browser source support PNG/JPEG input plus JSON Schema in the same on-device request. This is documented/source support, not measured inference success. Use ONLY_ON_DEVICE and onDeviceParams.promptOptions.responseConstraint, await initializeDeviceModel under user activation, and validate returned content locally.
- Critical source edge: chromeAdapterFactory returns undefined without LanguageModel; callCloudOrDevice can then choose its cloud callback before checking ONLY_ON_DEVICE. Sentinel callback reproduction and mocked fetch tests performed without real cloud inference. Missing API/browser creation is rejected by app guards. Hosting CSP blocks remote connections. A post-response ON_DEVICE assertion alone cannot prevent upload.
- Current gemini-3.5-flash-lite is documented as available without billing via the Gemini Developer API on Spark. Account quota, App Check and actual cloud runtime remain unverified; no cloud inference is enabled.
- Actual headless device checks were unavailable; five-letter Nano and combined recall/precision/latency remain NOT_RUN. Local regex scores are measured independently, not substituted.
- Devpost rules page says official rules are not yet available. Overview advertises Nov 11 start and Nov 30 22:00 UTC deadline. Pre-start work eligibility, AI tool restrictions, final prize terms and submission requirements are unresolved. Preserve preparatory spike timestamps. Do not represent it as eligibility-cleared entry work.

## Primary sources

- https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
- https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output
- https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
- https://firebase.google.com/docs/ai-logic/models
- https://firebase.google.com/docs/ai-logic/pricing
- https://developer.chrome.com/docs/ai/get-started
- https://firebasehybridaihackathon.devpost.com/rules
- https://registry.npmjs.org/@firebase/ai/-/ai-3.0.0.tgz
