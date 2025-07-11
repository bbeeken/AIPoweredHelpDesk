# AI Powered Help Desk

This project is a simple Node.js/Express application that demonstrates how an AI driven help desk might work with n8n integration.

## Features

- **Dashboard** route that greets the logged in user and summarizes their assigned tickets.
- **AI endpoint** that forwards natural language text to an n8n workflow for processing.
- Mock data for users and tickets to simulate a database.

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
