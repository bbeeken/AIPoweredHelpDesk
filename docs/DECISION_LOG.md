## Decision Log

### Added ticket history endpoint
- **Date:** 2025-07-11
- **Reasoning:** Needed API to audit ticket changes. Lightweight addition with minimal risk.
- **Impact:** Clients can fetch `/tickets/:id/history` to view modifications.

### Added assets assigned-to-user endpoint
- **Date:** 2025-07-11
- **Reasoning:** Improves staff workflow by quickly listing assets owned by a user. Low risk; simple filter on existing data.
- **Impact:** Clients can fetch `/assets/assigned/:userId` to see assets per user.

### Added asset history endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provide audit trail of asset assignments. Minimal code change leveraging existing history data.
- **Impact:** Clients can fetch `/assets/:id/history` to view assignment changes.

### Added Qdrant client script
- **Date:** 2025-07-11
- **Reasoning:** Enables storing ticket text in a vector database for future AI-powered search features. Standalone utility with no impact on the server.
- **Impact:** Run `python utils/qdrant_client.py` to push tickets into Qdrant.

### Added due-soon tickets endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides quick visibility into tickets approaching their deadline. Low risk filter on existing ticket data.
- **Impact:** Clients can fetch `/tickets/due-soon?days=2` to see tickets due in the next 2 days.

### Added asset depreciation endpoint
- **Date:** 2025-07-11
- **Reasoning:** Allows tracking when assets are depreciated to improve lifecycle management. Minimal risk as it only sets a timestamp.
- **Impact:** Clients can POST to `/assets/:id/depreciate` to mark an asset as depreciated.

### Added asset maintenance endpoints
- **Date:** 2025-07-11
- **Reasoning:** Enables tracking maintenance history and costs for assets. Low risk addition using in-memory arrays.
- **Impact:** Clients can POST to `/assets/:id/maintenance` to log work and GET `/assets/:id/maintenance` to view records.
