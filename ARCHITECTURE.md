# ChuChu — Core Architectural Decisions

This document records the design decisions locked during Phase 0.

### 1. Authentication Strategy
**Decision:** Defer real auth to Phase 5; use a local-only "guest" profile for Phases 0–3.
**Rationale:** Onboarding UI doesn't need to know yet whether accounts are email/OAuth/phone. The `user_profile` table is configured to support a single guest row (`id = 1`) now. This avoids making premature assumptions about multi-device sync or user mapping.

### 2. ML Inference Library
**Decision:** Use `react-native-fast-tflite` for mobile inference.
**Rationale:** Standardizing on TFLite early locks the preprocessing image pipeline and input/output tensor shapes. This ensures that the frontend and ML models fit together without post-hoc pipeline adaptations.

### 3. Cloud Escalation Design
**Decision:** The return shape of the classification module will include a `confidence` field and a `source: 'local' | 'cloud'` tag from day one.
**Rationale:** Designing the client-side API to be aware of classification source and confidence ensures we don't have to rewrite screen components when low-confidence cloud fallbacks are introduced in Phase 5.

### 4. State Management Scope
**Decision:** Zustand handles in-memory and transient session states (like selected archetype, onboarding steps progress). SQLite database remains the absolute source of truth for all persistent items (wardrobe, history, settings).
**Rationale:** Avoids state synchronization bugs and race conditions between memory states and database storage.

### 5. Offline-First Architecture
**Decision:** The app is designed to be fully functional offline. All screens query local SQLite, and image ingestion works entirely on-device.
**Rationale:** Prevents network calls from blocking core application loops. Cloud APIs (Phase 5) will layer on top as secondary sync/fallback paths, not primary blockages.
