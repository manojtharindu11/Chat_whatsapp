<div align="center">
  <h1>WhatsApp Business API Chat Integration</h1>
  <p>Send and receive WhatsApp messages using the WhatsApp Business Cloud API with a modern React frontend and Python Flask backend.</p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [WhatsApp API Usage](#whatsapp-api-usage)
- [Webhook Setup](#webhook-setup)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Overview

This project demonstrates how to integrate the WhatsApp Business Cloud API to send and receive WhatsApp messages. It includes:

- A **Flask backend** for handling WhatsApp API calls and webhooks
- A **React frontend** for chat UI and real-time messaging
- **Socket.IO** for real-time communication

## Features

- Send WhatsApp messages to clients
- Receive and display incoming WhatsApp messages
- Webhook verification and event handling
- Real-time updates with Socket.IO

## Architecture

```
[User] ⇄ [React Frontend] ⇄ [Flask Backend] ⇄ [WhatsApp Business Cloud API]
```

## Prerequisites

1. **WhatsApp Business Account**: [Create here](https://business.facebook.com/)
2. **Facebook App**: [Create here](https://developers.facebook.com/)
3. **WhatsApp Business Phone Number**: Registered in your Facebook App
4. **Cloud API Access Token**: Get from Facebook Developer Portal
5. **Phone Number ID**: From WhatsApp > API Setup
6. **Webhook Verify Token**: Any random string (used for webhook verification)

## Backend Setup

1. **Install Python dependencies:**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
2. **Create a `.env` file** in `backend/` with:
   ```env
   PORT=5010
   WEBHOOK_VERIFY_TOKEN=your_webhook_token
   GRAPH_API_TOKEN=your_whatsapp_graph_api_token
   YOUR_PHONE_NUMBER_ID=your_phone_number_id
   ```
3. **Run the backend server:**
   ```sh
   python app.py
   ```
   The backend will be available at `http://localhost:5010`.

## Frontend Setup

1. **Install Node.js dependencies:**
   ```sh
   cd frontend
   npm install
   ```
2. **Run the frontend app:**
   ```sh
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` (default Vite port).

## Frontend Usage & Customization

The frontend is built with React and Vite, located in the `frontend/` directory. It provides a real-time chat UI that connects to the backend using Socket.IO.

- **Connection:**

  - The frontend connects to the backend's Socket.IO server (default: `ws://localhost:5010`).
  - You may need to update the backend URL in `frontend/src/utils/socket.js` if running on a different host or port.

- **Structure:**

  - Main entry: `frontend/src/main.jsx`
  - App UI: `frontend/src/App.jsx`
  - Chat page: `frontend/src/pages/chat.jsx`
  - Socket logic: `frontend/src/utils/socket.js`

- **Customization:**

  - Update UI components in `src/pages/chat.jsx` and `src/App.jsx` to change the look and feel.
  - Add new features (e.g., file sharing, message history) by extending the React components and backend API.
  - Use environment variables or config files for dynamic backend URLs if deploying to production.

- **Connecting to Backend:**
  - Ensure the backend is running and accessible to the frontend (CORS is enabled by default).
  - The frontend emits and listens for Socket.IO events such as `send_message`, `receive_message`, and `connected_users`.

---

## Environment Variables

- `PORT`: Port for backend Flask server (default: 5010)
- `WEBHOOK_VERIFY_TOKEN`: Token for webhook verification
- `GRAPH_API_TOKEN`: WhatsApp Cloud API access token
- `YOUR_PHONE_NUMBER_ID`: WhatsApp Business phone number ID

## Running with Docker

1. **Build and run the backend Docker container:**
   ```sh
   cd backend
   docker build -t whatsapp-backend .
   docker run -p 5010:5002 --env-file .env whatsapp-backend
   ```
   Adjust ports as needed.

## WhatsApp API Usage

### Sending a Message

- The backend uses the WhatsApp Cloud API to send messages:
  - Endpoint: `https://graph.facebook.com/v18.0/{YOUR_PHONE_NUMBER_ID}/messages`
  - Method: `POST`
  - Headers: `Authorization: Bearer {GRAPH_API_TOKEN}`
  - Body:
    ```json
    {
      "messaging_product": "whatsapp",
      "to": "recipient_phone_number",
      "type": "text",
      "text": { "body": "Your message here" }
    }
    ```
- The backend exposes a Socket.IO event `send_message` for the frontend to trigger sending.

### Receiving a Message (Webhook)

- WhatsApp will POST incoming messages to your `/webhook` endpoint.
- The backend parses the message and emits it to the frontend via Socket.IO.

## Webhook Setup

1. **Expose your backend to the internet** (for local dev, use [ngrok](https://ngrok.com/)):
   ```sh
   ngrok http 5010
   ```
2. **Configure the webhook in Facebook Developer Portal:**
   - Callback URL: `https://<your-ngrok-domain>/webhook`
   - Verify Token: Use the same as `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to `messages` events

## API Endpoints

- `GET /clients` — List all clients
- `POST /clients` — Add a new client
- `GET /webhook` — Webhook verification (Facebook)
- `POST /webhook` — WhatsApp webhook event receiver

## Troubleshooting

- **403 on webhook verification:** Ensure your verify token matches and your endpoint is reachable.
- **Message not sent:** Check your access token, phone number ID, and WhatsApp Business account status.
- **No incoming messages:** Make sure webhook is set up and your server is accessible from the internet.

## References

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Setup Guide](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [ngrok](https://ngrok.com/)

---

## Demo

- **Backend API:** [https://chatwhatsapp-production-3a94.up.railway.app/](https://chatwhatsapp-production-3a94.up.railway.app/)
- **Frontend:** [https://chat-whatsapp-manoj-thilakarathnas-projects.vercel.app/](https://chat-whatsapp-manoj-thilakarathnas-projects.vercel.app/)
