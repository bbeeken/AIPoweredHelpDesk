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

### Added depreciated assets listing
- **Date:** 2025-07-11
- **Reasoning:** Helps staff track which assets are no longer in active service. Low risk filter of in-memory data.
- **Impact:** Clients can GET `/assets/depreciated` to retrieve all assets with a `depreciationDate`.

### Added asset search endpoint
- **Date:** 2025-07-11
- **Reasoning:** Allows staff to quickly find assets by name. Straightforward filter with minimal risk.
- **Impact:** Clients can GET `/assets/search?q=term` to locate matching assets.

### Added asset retirement endpoints
- **Date:** 2025-07-11
- **Reasoning:** Needed a way to mark assets as removed from service. Reuses existing in-memory data; low risk.
- **Impact:** Clients can POST `/assets/:id/retire` and GET `/assets/retired` to manage retired equipment.

### Added assignee filter for tickets listing
- **Date:** 2025-07-11
- **Reasoning:** Simplifies retrieving tickets assigned to a specific user without a separate endpoint. Minimal risk query filter.
- **Impact:** Clients can GET `/tickets?assignee=1` to list tickets for user 1.

### Integrated automatic Qdrant indexing on ticket creation
- **Date:** 2025-07-11
- **Reasoning:** Reduces manual steps by pushing new ticket text to Qdrant automatically.
- **Impact:** Tickets are indexed in the vector database as soon as they are created; failures are logged without affecting the API.

### Added asset maintenance cost endpoint
- **Date:** 2025-07-11
- **Reasoning:** Allows staff to quickly see total spend on an asset's maintenance. Low risk calculation over existing data.
- **Impact:** Clients can GET `/assets/:id/maintenance/total-cost` for cost summaries.

### Added asset tagging endpoints
- **Date:** 2025-07-11
- **Reasoning:** Enables categorizing assets and filtering by tag. Straightforward addition using arrays.
- **Impact:** Clients can GET/POST/DELETE `/assets/:id/tags` and filter assets with `GET /assets?tag=value`.

### Added aging tickets endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides visibility into tickets lingering in the queue for long periods. Uses existing history data to compute creation date. Minimal risk read-only endpoint.
- **Impact:** Clients can GET `/tickets/aging?days=7` to list old open tickets.

### Added assignedTo filter for assets list
- **Date:** 2025-07-11
- **Reasoning:** Mirrors ticket filtering capabilities and simplifies retrieving assets for a user via query parameter. Low risk since it filters existing data.
- **Impact:** Clients can GET `/assets?assignedTo=2` to list assets owned by user 2.

### Introduced MTTR stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Exposes a metric to track average ticket resolution time, supporting operational reporting. Implementation calculates the duration between ticket creation and closure using history data.
- **Impact:** Clients can GET `/stats/mttr` to retrieve the mean time to resolve tickets in hours.

### Added workload stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides visibility into ticket distribution among agents. Low risk read-only calculation using existing ticket data.
- **Impact:** Clients can GET `/stats/workload` to see open, waiting and closed counts per user.

### Added ticket reassign-least-busy endpoint
- **Date:** 2025-07-11
- **Reasoning:** Allows quickly redistributing work by automatically assigning a ticket to the agent with the smallest active queue. Uses existing helper function so risk is minimal.
- **Impact:** Clients can POST `/tickets/:id/reassign-least-busy` to move the ticket to the least busy user and record the change in history.
