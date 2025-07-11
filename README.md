# AI Powered Help Desk

This project is a simple Node.js/Express application that demonstrates how an AI driven help desk might work with n8n integration.

## Features

- **Dashboard** route that greets the logged in user and summarizes their assigned tickets.
- **Ticket management API** for creating, updating and commenting on tickets.
- **AI endpoint** that forwards natural language text to an n8n workflow for processing.
- Mock data for users and tickets to simulate a database.

### API Endpoints

- `GET /dashboard` – show a summary of tickets assigned to the current user.
- `GET /tickets` – list all tickets.
- You can filter by status or priority using query parameters, e.g.
  `GET /tickets?status=open&priority=high`.
- `GET /tickets/:id` – view a specific ticket.
- `POST /tickets` – create a new ticket. Requires a `question` field in the body.
- `PATCH /tickets/:id` – update ticket status, assignee or priority.
- `POST /tickets/:id/comments` – add a comment to a ticket.
- `GET /tickets/:id/attachments` – list attachments for a ticket.
- `POST /tickets/:id/attachments` – attach a file by providing `name` and `url`.

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

The n8n webhook URL can be configured via the `N8N_URL` environment variable.
