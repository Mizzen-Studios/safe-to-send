# Shared on-device contract

contract.json is the canonical quotes-v1 schema/prompt asset. Web imports it directly; Android may package the same asset without copying evaluation truth into prompts. See ../../docs/NANO_TEXT_PROTOCOL.md for strict matching, bounds and integration gates.

Model wire: detection findings [{quote,kind}]; verifier checks [{id,status,evidence:[{quote}]}]. Offsets belong only to local application Span records. A schema or prompt is not proof of privacy, semantic support or accuracy. Never send corpus annotations, mutation variants, expected verdicts or ground truth to the model.
