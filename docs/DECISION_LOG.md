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

### Added health check endpoint
- **Date:** 2025-07-11
- **Reasoning:** Basic monitoring support for load balancers and uptime tools. Very low risk standalone route.
- **Impact:** Clients can GET `/health` to verify service availability.

### Added ticket tag stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides insight into common support topics by tallying ticket counts per tag. Simple read-only calculation.
- **Impact:** Clients can GET `/stats/tags` to view how many tickets exist for each tag.

### Record due date changes in ticket history and added Qdrant vector test
- **Date:** 2025-07-11
- **Reasoning:** History was not capturing due date updates, hindering auditing. A lightweight patch records these events. A unit test now ensures deterministic Qdrant vectors.
- **Impact:** Ticket timelines now show due date adjustments and automated tests verify vector creation.

### Recorded asset creation in history
- **Date:** 2025-07-11
- **Reasoning:** Asset history lacked an entry for when the asset was first created. Adding this improves lifecycle auditing with minimal risk.
- **Impact:** POST `/assets` now includes a `created` record and history endpoints return the creation event.

### Added attachment deletion endpoint
- **Date:** 2025-07-11
- **Reasoning:** Users needed a way to remove uploaded files from tickets. Implementation mirrors other delete operations and carries minimal risk.
- **Impact:** Clients can DELETE `/tickets/:id/attachments/:attachmentId` to remove attachments.

### Added asset tag stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides visibility into asset categories by counting assets per tag. Read-only calculation with minimal risk.
- **Impact:** Clients can GET `/stats/asset-tags` to see asset counts by tag.

### Added ticket and asset deletion endpoints
- **Date:** 2025-07-11
- **Reasoning:** Needed a way to fully remove records from the system. Straightforward array splice operations carry minimal risk.
- **Impact:** Clients can DELETE `/tickets/:id` and `/assets/:id` to delete items.

### Improved asset history records
- **Date:** 2025-07-11
- **Reasoning:** Asset history entries lacked context when updating name or assignment. Adding detailed actions and user tracking improves auditing with minimal complexity.
- **Impact:** PATCH `/assets/:id` now logs `name` and `assignee` changes with `action`, `from`, `to`, `by` and `date` fields.

### Fixed asset assignedTo filter
- **Date:** 2025-07-11
- **Reasoning:** Filtering assets by assigned user failed when query parameter was provided as a string.
- **Impact:** GET /assets?assignedTo=n now reliably returns assets assigned to that user.

### Added assets-per-user stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Provides visibility into asset distribution among staff. Low risk read-only calculation.
- **Impact:** Clients can GET `/stats/assets-per-user` to see asset counts per user.

### Recorded depreciation and retirement in asset history
- **Date:** 2025-07-11
- **Reasoning:** Depreciation and retirement actions were not tracked, limiting lifecycle auditing. Adding history entries has minimal risk.
- **Impact:** POST `/assets/:id/depreciate` and `/assets/:id/retire` now append `depreciated` or `retired` events to asset history.

### Added user summary stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Needed quick overview of workload and assets per user. Simple calculation built on existing data.
- **Impact:** Clients can GET `/stats/user/:userId` to retrieve ticket counts and asset total for a user.

### Added priority stats endpoint
- **Date:** 2025-07-11
- **Reasoning:** Needed visibility into ticket distribution by priority. Simple read-only calculation with minimal risk.
- **Impact:** Clients can GET `/stats/priorities` to see counts for each priority level.
\n### Added comment deletion endpoint\n- **Date:** 2025-07-11\n- **Reasoning:** Needed ability to remove erroneous or outdated comments. Low risk extension using comment IDs.\n- **Impact:** Clients can DELETE `/tickets/:id/comments/:commentId` to remove a comment.

### Added unassigned assets endpoint
- **Date:** 2025-07-11
- **Reasoning:** Needed quick way to list spare equipment for allocation. Low risk read-only filter.
- **Impact:** Clients can GET `/assets/unassigned` to see assets without an assigned user.

### Added comment edit endpoint
- **Date:** 2025-07-11
- **Reasoning:** Users sometimes need to correct mistakes in comments. Editing improves collaboration with minimal impact.
- **Impact:** Clients can PATCH `/tickets/:id/comments/:commentId` with new text to modify a comment.

### Added sorting for ticket and asset listing
- **Date:** 2025-07-11
- **Reasoning:** Staff needed an easy way to order results. Sorting the in-memory arrays is straightforward and low risk.
- **Impact:** Clients can use `?sortBy=field&order=asc|desc` on `/tickets` and `/assets`.

### Added ticket escalation endpoint
- **Date:** 2025-07-11
- **Reasoning:** Allows agents to quickly mark a ticket as urgent without sending a full PATCH request. Low risk wrapper around priority update.
- **Impact:** Clients can POST `/tickets/:id/escalate` to set priority to `high` and record the change in history.

### Added unassigned tickets endpoint
- **Date:** 2025-07-11
- **Reasoning:** Mirror asset workflow by listing tickets without an assignee. Simple filter on in-memory data, minimal risk.
- **Impact:** Clients can GET `/tickets/unassigned` to retrieve tickets awaiting assignment.

### Added submitter filter for ticket listing
- **Date:** 2025-07-11
- **Reasoning:** Staff occasionally need to locate all tickets created by a specific user. A query parameter is an easy, low-risk addition.
- **Impact:** Clients can GET `/tickets?submitter=2` to list tickets submitted by user 2.

### Added ticket close and reopen endpoints
- **Date:** 2025-07-11
- **Reasoning:** Allows quick resolution or reopening of tickets without manual PATCH calls. Uses existing history logging so risk is low.
- **Impact:** Clients can POST `/tickets/:id/close` and `/tickets/:id/reopen` to change ticket status with history entries.

### Added maintenance cost stats endpoint
- **Date:** 2025-07-12
- **Reasoning:** Provides visibility into repair spending across assets. Simple aggregation of existing maintenance data with minimal risk.
- **Impact:** Clients can GET `/stats/maintenance-cost` to retrieve maintenance cost totals per asset.

### Added recent tickets endpoint
- **Date:** 2025-07-12
- **Reasoning:** Users wanted an easy way to view the newest tickets. Sorting by creation date and limiting results is low risk.
- **Impact:** Clients can GET `/tickets/recent?limit=5` to fetch the latest tickets.
### Added CORS middleware
- **Date:** 2025-07-11
- **Reasoning:** Allow cross-origin requests for API consumers. Simple headers with minimal risk.
- **Impact:** All routes now respond with `Access-Control-Allow-Origin: *` and handle OPTIONS preflight.

### Added asset last-maintenance endpoint
- **Date:** 2025-07-12
- **Reasoning:** Helps staff quickly see when an asset was last serviced. Low risk read-only addition.
- **Impact:** Clients can GET `/assets/:id/maintenance/last` to retrieve the latest maintenance record.

### Added ticket manual assign endpoint
- **Date:** 2025-07-12
- **Reasoning:** Allows explicitly assigning a ticket to a user without sending a PATCH request. Minimal risk wrapper around existing update logic.
- **Impact:** Clients can POST `/tickets/:id/assign/:userId` to change a ticket's assignee and log history.

### Added overdue stats endpoint
- **Date:** 2025-07-13
- **Reasoning:** Provides visibility into outstanding work by counting overdue tickets per agent. Low risk read-only calculation.
- **Impact:** Clients can GET `/stats/overdue` to see overdue ticket counts for each user.

### Fixed asset listing routes order
- **Date:** 2025-07-13
- **Reasoning:** `/assets/depreciated` and `/assets/retired` were unreachable because they were defined after `/assets/:id`. Moved them earlier to ensure correct routing.
- **Impact:** Clients can access these endpoints reliably again.

### Added comment statistics endpoint
- **Date:** 2025-07-13
- **Reasoning:** Needed insight into comment activity per ticket. Simple aggregation with minimal risk.
- **Impact:** Clients can GET `/stats/comments` to retrieve comment counts per ticket.

### Added single comment retrieval endpoint
- **Date:** 2025-07-14
- **Reasoning:** Completes comment CRUD API by allowing clients to fetch a specific comment. Very low risk read-only route.
- **Impact:** Clients can GET `/tickets/:id/comments/:commentId` to view one comment.

### Increased server keep-alive timeout
- **Date:** 2025-07-15
- **Reasoning:** Tests experienced intermittent socket hang ups due to Node's 5s default keep-alive timeout. Modified the custom Express server to set a 30s keep-alive which reduces connection resets.
- **Impact:** All http servers created via `express` now hold connections open longer; no API changes.

### Improved front-end accessibility
- **Date:** 2025-07-16
- **Reasoning:** The demo pages lacked semantic structure and ARIA attributes making screen reader navigation difficult.
- **Impact:** Users benefit from responsive layouts and live updates that comply with basic accessibility guidelines.

### Unified front-end styling
- **Date:** 2025-07-17
- **Reasoning:** Inline styles on each page duplicated code and limited responsive enhancements. Consolidating them into a shared stylesheet simplifies maintenance and allows mobile tweaks.
- **Impact:** Both `index.html` and `chat.html` now load `styles.css`, providing consistent look and navigation across the demo.

### Added skip link for keyboard navigation
- **Date:** 2025-07-18
- **Reasoning:** Keyboard and screen reader users benefit from a quick way to bypass repetitive headers.
- **Impact:** `index.html` and `chat.html` include a focusable "Skip to content" link styled in `styles.css`.
