# AI Powered Help Desk

This project is a simple Node.js/Express application that demonstrates how an AI driven help desk might work with n8n integration.

## Features

- **Dashboard** route that greets the logged in user and summarizes their assigned tickets.
- **Ticket management API** for creating, updating and commenting on tickets.
- **Asset management API** for tracking staff equipment.
- **AI endpoint** that forwards natural language text to an n8n workflow for processing.
- Mock data for users, tickets and assets to simulate a database.
- **Qdrant client script** for indexing ticket text in a vector database.
- **Automatic Qdrant indexing** of newly created tickets when the server is running.

### API Endpoints

- `GET /dashboard` – show a summary of tickets assigned to the current user.
- `GET /tickets` – list all tickets.
  You can filter by status, priority, tag or assignee using query parameters, e.g.
  `GET /tickets?status=open&priority=high&tag=urgent&assignee=1`.
- `GET /tickets/:id` – view a specific ticket.
- `POST /tickets` – create a new ticket. Requires a `question` field in the body.
- `PATCH /tickets/:id` – update ticket status, assignee, priority or `dueDate`.
- `POST /tickets/:id/comments` – add a comment to a ticket.
- `GET /tickets/:id/attachments` – list attachments for a ticket.
- `POST /tickets/:id/attachments` – attach a file by providing `name` and `url`.
- `GET /tickets/:id/history` – view the change history of a ticket.
- `GET /tickets/:id/tags` – list tags for a ticket.
- `POST /tickets/:id/tags` – add a tag using `{tag:"example"}` or `{tags:[...]}`.
- `DELETE /tickets/:id/tags/:tag` – remove a tag from a ticket.
- `GET /tickets/search?q=text` – search tickets by question, comment or tag.
- `GET /tickets/overdue` – list tickets past their `dueDate`.
- `GET /tickets/due-soon?days=n` – list tickets due within the next `n` days (default 3).
- `GET /tickets/aging?days=n` – list open tickets created more than `n` days ago (default 7).
- `GET /assets` – list all assets. Filter by tag with `?tag=value`.
- `POST /assets` – create a new asset with `name`, optional `assignedTo` and optional `tags` array.
- `GET /assets/:id` – view a specific asset.
- `GET /assets/:id/history` – view the assignment history of an asset.
- `GET /assets/assigned/:userId` – list assets assigned to a user.
- `PATCH /assets/:id` – update asset `name` or `assignedTo`.
- `POST /assets/:id/depreciate` – mark an asset as depreciated.
- `GET /assets/depreciated` – list all depreciated assets.
- `POST /assets/:id/retire` – mark an asset as retired.
- `GET /assets/retired` – list all retired assets.
- `GET /assets/search?q=text` – search assets by name.
- `GET /assets/:id/maintenance` – view maintenance records for an asset.
- `POST /assets/:id/maintenance` – add a maintenance record with `description` and optional `cost`.
- `GET /assets/:id/maintenance/total-cost` – get the sum of all maintenance costs for an asset.
- `GET /assets/:id/tags` – list tags for an asset.
- `POST /assets/:id/tags` – add one or more tags to an asset.
- `DELETE /assets/:id/tags/:tag` – remove a tag from an asset.

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
