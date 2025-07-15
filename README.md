# AI Powered Help Desk

This project is a simple Node.js/Express application that demonstrates how an AI driven help desk might work with n8n integration.

For the long-term roadmap, see [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

For a summary of the modernization vision and design standards, read
[docs/TRANSFORMATION_GUIDE.md](docs/TRANSFORMATION_GUIDE.md).

## Features

- **Dashboard** route that greets the logged in user and summarizes their assigned tickets.
- **Ticket management API** for creating, updating and commenting on tickets. Ticket history records status, assignee, priority and due date changes.
- **Asset management API** for tracking staff equipment.
- **AI endpoint** that forwards natural language text to an n8n workflow for processing.

- **NLP-based routing** automatically assigns and prioritizes new tickets based on their content when no assignee or priority is provided.

- **Sentiment analysis** for tickets and comments using a simple NLP model.

- Mock data for users, tickets and assets to simulate a database.
- **Qdrant client script** for indexing ticket text in a vector database.
- **Automatic Qdrant indexing** of newly created tickets when the server is running.
- **Language detection and translation** for new tickets with sentiment-based tag suggestions.
- **Ticket escalation endpoint** for quickly setting priority to high.
- **Offline-capable UI** using a service worker and web app manifest.
- **Automatic translation** of new tickets into English with original text preserved.

- **Third-party integrations** placeholders for Slack, Microsoft Teams, Jira and Salesforce connectors.

- **Real-time updates** via a Server-Sent Events endpoint.
- **Toast notifications** for ticket events with auto-refreshing stats.
- **Notification settings** page to opt into email or push alerts for future AI triage.
- **Wildcard routing** using `*` to match any path.

- **Stats dashboard** showing ticket counts, mean resolution time and a 7-day ticket forecast.
- **Knowledge base integration** with AI-suggested articles.
- **Self-service portal** for users to search articles and track tickets.
- **Community forums** to share solutions and ideas.


### API Endpoints
- `GET /health` – simple health check returning `{status:"ok"}`.

- `GET /dashboard` – show a summary of tickets assigned to the current user.
  - `GET /tickets` – list all tickets.
    You can filter by status, priority, tag, assignee or submitter using query parameters, e.g.
    `GET /tickets?status=open&priority=high&tag=urgent&assignee=1&submitter=2`.
    Results may also be sorted with `?sortBy=field&order=asc|desc`.
- `GET /tickets/:id` – view a specific ticket.
- `POST /tickets` – create a new ticket. Requires a `question` field. When
  `assigneeId` or `priority` are omitted, the text is analyzed and defaults are
  chosen based on the detected category.
- `PATCH /tickets/:id` – update ticket status, assignee, priority or `dueDate`.
- `DELETE /tickets/:id` – remove a ticket completely.
- `POST /tickets/:id/reassign-least-busy` – automatically assign the ticket to the agent with the fewest open tickets.
- `POST /tickets/:id/assign/:userId` – assign the ticket to a specific user.
- `POST /tickets/:id/escalate` – set ticket priority to high.
- `POST /tickets/:id/close` – change ticket status to closed.
- `POST /tickets/:id/reopen` – reopen a closed ticket.
 - `POST /tickets/:id/comments` – add a comment to a ticket. Include `isInternal: true` to keep it hidden from the ticket submitter. `@mentions` are returned highlighted in an `html` field.
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
- `GET /events` – subscribe to real-time ticket events via Server-Sent Events.

- `POST /sentiment` – analyze text and return a sentiment score and label.

- `GET /assist` – stream proactive assistance tips as you type. POST text to `/assist` to broadcast suggestions.

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
- `GET /stats/forecast?days=N` – predicted ticket volume for the next N days.
- `GET /stats/dashboard` – aggregate counts, forecast and MTTR for the landing page.
- `GET /stats/user/:userId` – summary of ticket counts and assets for a user.

## Getting Started

1. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
2. (Optional) build the TypeScript server:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```
   You can test sentiment analysis with:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"text":"I love this"}' http://localhost:3000/sentiment
   ```
4. Run tests:
   ```bash
   npm test
   ```

### Database Setup

To migrate the sample data into a MSSQL database you can use the provided
migration script. Ensure your connection details are configured in a `.env`
file based on `.env.example` and run:

```bash
npm run migrate
```

This executes `migrate.js` which creates the tables defined in
`migrations/schema.sql` and populates them using `migrations/seed.sql`.

The Qdrant client script can be used separately to index ticket text. See
`docs/QDRANT_CLIENT.md` for details.

### Using a MSSQL Database

By default the server uses in-memory mock data. To fetch ticket data from an
actual MSSQL database set `USE_MSSQL=true` in your `.env` file along with the
standard `DB_*` connection settings. When enabled the `/tickets` and
`/tickets/:id` endpoints read from the `V_Ticket_Master_Expanded` view.

Other useful environment variables include:

- `N8N_URL` – n8n workflow webhook URL.
- `QDRANT_URL` – base address of the Qdrant server.
- `OPENAI_API_KEY` – API key for calling OpenAI services used by `aiService`.
- `TRANSLATE_URL` – HTTP endpoint for the translation service.
- `TRANSLATE_API_KEY` – API key used when contacting the translation provider.
- `CORS_ORIGIN` – allowed origin for the React frontend.
- `DEFAULT_LANGUAGE` – default language code for translations.

After the first visit, the pages are cached for offline use via a service worker.
An experimental `realtime.html` page demonstrates live ticket notifications using the `/events` SSE endpoint.
The `chat.html` page now connects to `/assist` for streaming proactive suggestions.

### Authentication

Use `POST /auth/login` with `username` and `password` to obtain a JWT token.
Pass it using `Authorization: Bearer <token>` to `/auth/verify` to validate
the session.

### Frontend

The user interface has moved to a React application in the `frontend` directory.
Before starting the server, run `npm install && npm run build` in that folder to
produce the `dist` directory. This build now compiles the knowledge base,
self-service portal and community pages. A blank page or MIME type errors in the browser
usually mean the `frontend/dist` directory is missing or the server could not
find it. During development you can run `npm run dev` for hot reloading. The dashboard includes
ticket tables, real-time updates via Server-Sent Events and a new analytics
page rendered with Chart.js.

### Translation

When a ticket is submitted in a non-English language, the server attempts to
translate the text to English using the provider configured via `TRANSLATE_URL`.
The original text and detected language are stored on the ticket so the
dashboard and chat views can display both versions when they differ.

### DevOps

A `Dockerfile` is provided for containerization and a GitHub Actions workflow
executes the test suite on each push.

## License

This project is licensed under the [MIT License](LICENSE).

