# MouthBeat

**Turn a beatbox, hum, or tap into a pattern you can shape and play.**

MouthBeat is a proposed Android-first music sketchpad: capture a short musical idea, translate it into editable Strudel patterns, and develop it through visual controls or live code. Playback is intended to happen inside the app, including offline with bundled sounds.

> **Status: browser editor/player prototype.** The [editor](editor/README.md) now includes bundled Strudel playback, starter grooves, and event-based code highlighting. Android packaging, recording/transcription, payments, and commercial release remain planned. MouthBeat is a working name; trademark clearance remains pending.

## The experience

1. Record a beatbox phrase, hummed melody, or tapped rhythm.
2. Review estimated timing, tempo, percussion classes, or notes; correct uncertain detections.
3. Hear the resulting loop through an embedded Strudel engine.
4. Edit steps, notes, swing, tempo, sounds, and effects visually, or open the live code editor.
5. Save a project and share or export supported results when those capabilities are implemented.

The first useful version should prioritize short, single-part rhythmic phrases. Hummed melody transcription is a separate technical milestone, not a promise of accurate recognition of arbitrary recordings. Polyphonic transcription, full-song arrangement, collaboration, and a public remix feed are outside the initial MVP.

## Proposed technical approach

```text
Microphone / taps
       ↓
Local onset, tempo and pitch analysis
       ↓
Editable event model: timing, duration, voice, pitch, confidence
       ↓
Visual editor ↔ supported Strudel pattern representation
       ↓
Bundled Strudel runtime + cleared sounds → in-app audio
```

Evaluate an Android shell hosting a locally bundled web audio/editor layer. Choose the framework after testing audio latency, microphone capture, Android WebView behavior, and maintainability on real devices. Recognition should work locally for the core flow; cloud processing, if ever added, requires a separate consent and cost decision.

Strudel's official [package overview](https://strudel.cc/technical-manual/packages/) identifies `@strudel/core`, `@strudel/mini`, and `@strudel/transpiler` for patterns and language support, `@strudel/webaudio` for audio output, and `@strudel/repl` or `@strudel/web` as broader integration options. Select the smallest suitable set after the prototype.

Offline playback means bundling the chosen runtime, audio worklets, samples, presets, fonts, and other required assets. Do not depend on a hosted iframe, CDN, remote sample URL, or live Strudel website for the core flow. Prove this on a fresh installation in airplane mode.

Keep a structured event model as the source for visual editing. Generated patterns should use a documented subset. Arbitrary live code may not round-trip into the visual editor; preserve it without destructive conversion and explain unsupported visual edits. Schedule edits at musical boundaries, retain the last playable pattern on errors, and provide an immediate stop control.

## Roadmap

All phases are planned. Progress depends on the exit criteria, rather than calendar promises.

### Phase 0 — Product, name, and license decisions

- [ ] Interview target creators and test the record → correct → replay workflow.
- [ ] Define MVP scope, supported devices, accessibility goals, and measurable audio/recognition targets.
- [ ] Search relevant trademark registers, app stores, domains, and competing uses; obtain qualified clearance for intended markets before committing to MouthBeat branding.
- [ ] Decide the AGPL-compatible distribution and source-delivery plan before integrating Strudel into a release.
- [ ] Inventory candidate libraries, models, datasets, and sounds; document ownership and commercial redistribution rights.

**Exit:** a short product specification, an explicit licensing decision, a recorded name-clearance outcome or replacement name, and an agreed validation plan.

### Phase 1 — Feasibility prototype

- [ ] Capture short phrases; detect onsets and estimate tempo; implement tap input as a predictable baseline.
- [ ] Map a limited set of beatbox sounds to percussion voices, with editable confidence results.
- [ ] Generate patterns and play them using locally bundled Strudel and a small cleared sound set.
- [ ] Prove a visual rhythm editor, basic code editing, error recovery, and safe stopping.
- [ ] Benchmark capture-to-preview time, playback latency, drift, CPU, memory, and battery on representative phones.
- [ ] Investigate monophonic hum-to-note conversion independently; defer if it compromises rhythm quality.

**Exit:** an end-to-end demonstration on real Android hardware, including airplane-mode playback, with measured limitations and a go/no-go decision.

### Phase 2 — Android MVP

- [ ] Add microphone permissions, onboarding, recording limits, retry, trim, quantization, and correction controls.
- [ ] Build tempo, swing, step, instrument, and volume controls plus a usable live code editor.
- [ ] Implement local project save/load, autosave, undo/redo, schema versioning, and recovery after interruption.
- [ ] Bundle presets and cleared sounds; implement pattern-text export and sharing with explicit user action.
- [ ] Add rendered audio export only after its audio quality, file behavior, and rights are validated.
- [ ] Handle audio focus, calls, route changes, headphones, screen locking, and app lifecycle transitions.
- [ ] Provide accessible touch targets, readable contrast, screen-reader labels, and clear error messages.

**Exit:** new users can record, correct, edit, save, reopen, and replay a loop without assistance on the supported device matrix.

### Phase 3 — Testing and release hardening

- [ ] Unit-test timing, quantization, event serialization, pattern generation, and supported visual/code conversions.
- [ ] Run integration tests for permission denial/revocation, missing assets, corrupted projects, migrations, and export failures.
- [ ] Evaluate recognition on consented, appropriately licensed recordings spanning voices, noise levels, microphones, tempos, and styles; publish internal accuracy and correction-time results.
- [ ] Test offline first run, repeated recording, long playback, low storage, low memory, and interrupted sessions.
- [ ] Run closed Android testing across OS versions and device tiers; measure crashes, audio glitches, task success, and accessibility issues.
- [ ] Establish and meet numeric release thresholds before accepting a release candidate.

**Exit:** no unresolved release-blocking defects, repeatable builds, documented test results, and an owner for every remaining limitation.

### Phase 4 — Licensing, privacy, and security gate

- [ ] Pin exact dependency versions and commit a lockfile; produce an SBOM and transitive license report for the actual release build.
- [ ] Review samples, soundfonts, presets, model weights, training data, fonts, and artwork separately from software licenses.
- [ ] Include required license texts, attribution, modification notices, and a tested corresponding-source delivery path.
- [ ] Review the combined application and store distribution terms for AGPL compatibility with qualified counsel.
- [ ] Keep recordings local by default; implement deletion, retention controls, and any required consent before introducing uploads or analytics.
- [ ] Threat-model imported projects and live code. Isolate execution from privileged native bridges, restrict navigation/network access, validate imports, and test resource exhaustion and malicious patterns.
- [ ] Protect signing keys and credentials, scan dependencies and secrets, and document vulnerability reporting and updates.
- [ ] Publish privacy information matching actual data behavior and prepare accurate store data disclosures.

**Exit:** documented license compatibility, source availability, asset rights, privacy review, and security review. A private development repository alone does not satisfy release obligations.

### Phase 5 — Payments and business validation

- [ ] Validate willingness to pay and choose a simple model: paid app, one-time upgrade, or optional subscription with continuing value.
- [ ] Decide what remains available offline and what purchasers receive; avoid promises the implementation cannot support.
- [ ] Check current Google Play billing requirements for the product, region, and distribution channel at implementation time.
- [ ] Test purchase, cancellation, refund, restore, pending transactions, entitlement recovery, and offline behavior in the billing sandbox.
- [ ] Keep payment secrets off-device; verify entitlements appropriately and prevent duplicate fulfillment.
- [ ] Model platform fees, taxes, refunds, support, hosting, and any inference costs; set spending limits before adding cloud features.

**Exit:** tested billing, clear pricing and terms, sustainable unit economics, and a support/refund process. Charging for software does not remove open-source obligations.

### Phase 6 — App-store launch

- [ ] Recheck current Android target requirements, developer verification, testing eligibility, content rating, billing policies, and store rules.
- [ ] Prepare a signed release bundle, screenshots, truthful feature descriptions, support contact, privacy policy, and license/source links.
- [ ] Complete required testing tracks and policy declarations; resolve review findings.
- [ ] Use a staged rollout with crash/audio monitoring, release notes, and a tested rollback or hotfix process.

**Exit:** store approval and a controlled production release meeting the previous gates. Approval and commercial success are not guaranteed.

### Phase 7 — Commercial operation

- [ ] Maintain a support queue, incident process, vulnerability response, backups, and release ownership.
- [ ] Track activation, successful loop creation, correction effort, retention, conversion, refunds, and costs with privacy-respecting measurement.
- [ ] Keep source delivery and notices aligned with every shipped build; review dependency and asset changes continuously.
- [ ] Test Android/WebView updates, maintain billing compatibility, and budget for device coverage and accessibility improvements.
- [ ] Prioritize better recognition and hum support from evidence; evaluate iOS only after a separate platform and license review.

**Exit:** an ongoing operating cadence with accountable owners and measured product value.

## Strudel licensing and dependency review

Checked **2026-10-19**. The official [integration guide](https://strudel.cc/technical-manual/project-start/) identifies Strudel as AGPL-3.0 and requires compatible licensing for integrations. The published [`@strudel/core` 1.2.5 manifest](https://app.unpkg.com/@strudel/core@1.2.5/files/package.json) declares **AGPL-3.0-or-later**, runtime dependency `fraction.js` `^5.2.1`, and development tools Vite `^6.0.11` and Vitest `^3.0.4`. This is a checked version, not a claim about the latest release or a complete dependency audit.

The canonical source is [uzu/strudel on Codeberg](https://codeberg.org/uzu/strudel). Direct access to its current branch manifests was unavailable during this review. Recheck the exact upstream commit, package licenses, and complete transitive tree selected for MouthBeat before implementation and each release; no dependencies are installed in this planning repository.

Commercial use can coexist with AGPL compliance. Plan for license notices, corresponding source and build materials for conveyed covered software, and applicable source offers to users interacting remotely with modified covered software. Consult the [AGPL text](https://www.gnu.org/licenses/agpl-3.0.html) for precise conditions. A WebView boundary or payment model should not be assumed to exempt the combined product.

## Repository and contribution policy

Intended GitHub home: `Straconis/mouthbeat`, private during planning. Private development is a workflow choice, not a proprietary licensing strategy for a distributed Strudel integration.

Run the browser prototype using the instructions in [editor/README.md](editor/README.md). The original editor code is licensed AGPL-3.0-or-later; see [LICENSE](LICENSE). Upstream components retain their own licenses. Do not add secrets, user recordings, uncleared sounds, or third-party code without provenance. Record architecture and licensing decisions as implementation begins.

**Next milestone:** prove a short tapped or beatboxed rhythm can become a corrected, editable loop with fully offline playback on a real Android phone.
