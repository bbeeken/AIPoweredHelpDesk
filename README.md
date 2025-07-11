# AI Powered Help Desk

This project is a simple Node.js/Express application that demonstrates how an AI driven help desk might work with n8n integration.

## Features

- **Dashboard** route that greets the logged in user and summarizes their assigned tickets.
- **Ticket management API** for creating, updating and commenting on tickets. Ticket history records status, assignee, priority and due date changes.
- **Asset management API** for tracking staff equipment.
- **AI endpoint** that forwards natural language text to an n8n workflow for processing.
- Mock data for users, tickets and assets to simulate a database.
- **Qdrant client script** for indexing ticket text in a vector database.
- **Automatic Qdrant indexing** of newly created tickets when the server is running.
- **Ticket escalation endpoint** for quickly setting priority to high.

### API Endpoints
- `GET /health` – simple health check returning `{status:"ok"}`.

- `GET /dashboard` – show a summary of tickets assigned to the current user.
  - `GET /tickets` – list all tickets.
    You can filter by status, priority, tag, assignee or submitter using query parameters, e.g.
    `GET /tickets?status=open&priority=high&tag=urgent&assignee=1&submitter=2`.
    Results may also be sorted with `?sortBy=field&order=asc|desc`.
- `GET /tickets/:id` – view a specific ticket.
- `POST /tickets` – create a new ticket. Requires a `question` field in the body.
- `PATCH /tickets/:id` – update ticket status, assignee, priority or `dueDate`.
- `DELETE /tickets/:id` – remove a ticket completely.
- `POST /tickets/:id/reassign-least-busy` – automatically assign the ticket to the agent with the fewest open tickets.
- `POST /tickets/:id/assign/:userId` – assign the ticket to a specific user.
- `POST /tickets/:id/escalate` – set ticket priority to high.
- `POST /tickets/:id/close` – change ticket status to closed.
- `POST /tickets/:id/reopen` – reopen a closed ticket.
- `POST /tickets/:id/comments` – add a comment to a ticket.
- `PATCH /tickets/:id/comments/:commentId` – edit a comment's text.
- `GET /tickets/:id/comments/:commentId` – view a specific comment.
- `DELETE /tickets/:id/comments/:commentId` – remove a comment from a ticket.
- `GET /tickets/:id/attachments` – list attachments for a ticket.
- `POST /tickets/:id/attachments` – attach a file by providing `name` and `url`.
- `DELETE /tickets/:id/attachments/:attachmentId` – remove an attachment.
- `GET /tickets/:id/history` – view the change history of a ticket.
- `GET /tickets/:id/tags` – list tags for a ticket.
- `POST /tickets/:id/tags` – add a tag using `{tag:"example"}` or `{tags:[...]}`.
- `DELETE /tickets/:id/tags/:tag` – remove a tag from a ticket.
- `GET /tickets/search?q=text` – search tickets by question, comment or tag.
- `GET /tickets/overdue` – list tickets past their `dueDate`.
- `GET /tickets/due-soon?days=n` – list tickets due within the next `n` days (default 3).
- `GET /tickets/aging?days=n` – list open tickets created more than `n` days ago (default 7).
- `GET /tickets/recent?limit=n` – list the most recently created tickets (default 5).
- `GET /tickets/unassigned` – list tickets that have no assignee.
- `GET /assets` – list all assets. Filter by tag with `?tag=value` or by assignee with `?assignedTo=userId`.
  Results may also be sorted with `?sortBy=field&order=asc|desc`.
- `POST /assets` – create a new asset with `name`, optional `assignedTo` and optional `tags` array. Creation is recorded in the asset's history.
- `GET /assets/:id` – view a specific asset.
- `GET /assets/:id/history` – view the creation, assignment and name change history of an asset.
- `GET /assets/assigned/:userId` – list assets assigned to a user.
- `GET /assets/unassigned` – list assets that are not assigned to anyone.
- `PATCH /assets/:id` – update asset `name` or `assignedTo`. Changes are logged in the asset's history.
- `DELETE /assets/:id` – remove an asset from inventory.
- `POST /assets/:id/depreciate` – mark an asset as depreciated.
- `GET /assets/depreciated` – list all depreciated assets.
- `POST /assets/:id/retire` – mark an asset as retired.
- `GET /assets/retired` – list all retired assets.
- `GET /assets/search?q=text` – search assets by name.
- `GET /assets/:id/maintenance` – view maintenance records for an asset.
- `POST /assets/:id/maintenance` – add a maintenance record with `description` and optional `cost`.
- `GET /assets/:id/maintenance/total-cost` – get the sum of all maintenance costs for an asset.
- `GET /assets/:id/maintenance/last` – get the most recent maintenance record for an asset.
- `GET /assets/:id/tags` – list tags for an asset.
- `POST /assets/:id/tags` – add one or more tags to an asset.
- `DELETE /assets/:id/tags/:tag` – remove a tag from an asset.
- `GET /stats` – basic counts of open, waiting and closed tickets plus asset total.
- `GET /stats/mttr` – average time to resolve closed tickets in hours.
- `GET /stats/workload` – ticket counts per user broken down by status.
- `GET /stats/priorities` – counts of tickets per priority.
- `GET /stats/tags` – counts of tickets per tag.
- `GET /stats/asset-tags` – counts of assets per tag.
- `GET /stats/assets-per-user` – counts of assets assigned to each user.
- `GET /stats/maintenance-cost` – total maintenance cost per asset.
- `GET /stats/comments` – number of comments per ticket.
- `GET /stats/overdue` – counts of overdue tickets per user.
- `GET /stats/user/:userId` – summary of ticket counts and assets for a user.

## Getting Started

1. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Run tests:
   ```bash
   npm test
   ```

The Qdrant client script can be used separately to index ticket text. See
`docs/QDRANT_CLIENT.md` for details.

The n8n webhook URL can be configured via the `N8N_URL` environment variable.
The Qdrant server URL can be set with the `QDRANT_URL` environment variable.
