from gevent import monkey

monkey.patch_all()

from flask import Flask, request
from flask_socketio import SocketIO
from gevent.lock import Semaphore  # gevent-safe lock
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  # load variables from .env

PORT = os.getenv("PORT", 5010)
WEBHOOK_VERIFY_TOKEN = os.getenv("WEBHOOK_VERIFY_TOKEN")
GRAPH_API_TOKEN = os.getenv("GRAPH_API_TOKEN")
YOUR_PHONE_NUMBER_ID = os.getenv("YOUR_PHONE_NUMBER_ID")

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent", logger=True, engineio_logger=True)

# Set to keep track of connected user socket IDs
connected_users = set()
# Semaphore for thread-safe access to connected_users
users_lock = Semaphore()

clients = [
    {"id": 1, "name": "Nilanthini", "whatsapp": "0771234567"},
    {"id": 2, "name": "Chamod", "whatsapp": "0777654321"},
    {"id": 3, "name": "Manoj", "whatsapp": "94763241208"},
]

def send_message(data):
    body = data["content"]
    client_id = data["to"]
    business_phone_number_id = YOUR_PHONE_NUMBER_ID
    recipient_phone_number = [client["whatsapp"] for client in clients if client["id"] == client_id]
    url = f'https://graph.facebook.com/v18.0/{business_phone_number_id}/messages'

    headers = {
        "Authorization": f"Bearer {GRAPH_API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_phone_number,
        "type": "text",
        "text": {
            "body": body
        }
    }

    response = requests.post(url=url, headers=headers, json=payload)

    if response.status_code == 200:
        print("✅ Message sent successfully")
    else:
        print("❌ Failed to send message:", response.status_code, response.text)
        
# Helper function to emit the list of currently connected users to all users
def emit_connected_users():
    with users_lock:
        users_list = [{"socketId": sid} for sid in connected_users]
    print(f"Emitting connected users: {users_list}")
    socketio.emit("connected_users", users_list)

def send_response_message(data):
    entry = data.get("entry", [])
    if not entry:
        logger.warning("No entry found in the webhook data")
        return

    changes = entry[0].get("changes", [])
    if not changes:
        logger.warning("No changes found in the webhook data")
        return

    value = changes[0].get("value", {})
    messages = value.get("messages", [])
    if not messages:
        logger.warning("No messages found in the webhook data")
        return

    message = messages[0]
    if message.get("type") == "text":
        from_ = message.get("from", "")
        if not from_:
            logger.warning("No sender found in the message")
            return

        content = message.get("text", {}).get("body", "")
        to = "self"
        time_stamp = message.get("timestamp", "")

        socketio.emit("receive_message", {
            "from": from_,
            "content": content,
            "to": to,
            "timestamp": time_stamp
        })
    else:
        logger.info("Message type is not text, ignoring.")

@app.route("/webhook", methods=["GET"])
def verify_webhook():
    # Verify the webhook with the token
    if request.args.get("hub.mode") == "subscribe" and request.args.get("hub.verify_token") == WEBHOOK_VERIFY_TOKEN:
        print("Webhook verified successfully")
        logger.info("Webhook verified successfully")
        return request.args.get("hub.challenge"), 200
    else:
        logger.warning("Webhook verification failed")
        return "Verification failed", 403
    
@app.route("/webhook", methods=["POST"])
def handle_webhook():
    # Handle incoming webhook events
    data = request.json
    send_response_message(data)
    logger.info(f"Received webhook event: {data}")
    return "Webhook event received", 200

@app.route("/clients", methods=["GET"])
def get_clients():
    return {"clients": clients}

@app.route("/", methods=["GET"])
def index():
    return "Welcome to the WhatsApp Chat Server! Checkout README.md for more details."

# Event handler for new user connection
@socketio.on("connect")
def handle_connect():
    print(f"User connected: {request.sid}")
    with users_lock:
        connected_users.add(request.sid)
    emit_connected_users()

@socketio.on("get_user_list")
def send_user_list(args):
    emit_connected_users()

# Event handler for client disconnection
@socketio.on("disconnect")
def handle_disconnect():
    with users_lock:
        connected_users.discard(request.sid)
    print(f"User disconnected: {request.sid if hasattr(request, 'sid') else 'No SID'}")
    emit_connected_users()

# Event handler for receiving a message from a user
@socketio.on("send_message")
def handle_send_message(data):
    user_sid = request.sid
    if user_sid:
        response = send_message(data)
        socketio.emit("send_message_response", response, to=user_sid)
    else:
        # Broadcast message to all clients
        socketio.emit("send_message_response", "Something went wrong", broadcast=True)

# Entry point: run the server with gevent and WebSocket support
if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    print(f"Starting Socket.IO server on ws://localhost:{PORT}")
    # Start the WSGI server with WebSocket handler
    server = pywsgi.WSGIServer(("0.0.0.0", int(PORT)), app, handler_class=WebSocketHandler)
    server.serve_forever()
