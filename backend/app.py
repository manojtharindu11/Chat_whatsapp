
# Patch all standard library modules for cooperative yielding with gevent
from gevent import monkey
monkey.patch_all()

# Import required libraries
from flask import Flask, request
from flask_socketio import SocketIO
from gevent.lock import Semaphore  # gevent-safe lock
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Application configuration
PORT = os.getenv("PORT", 5010)
WEBHOOK_VERIFY_TOKEN = os.getenv("WEBHOOK_VERIFY_TOKEN")
GRAPH_API_TOKEN = os.getenv("GRAPH_API_TOKEN")
YOUR_PHONE_NUMBER_ID = os.getenv("YOUR_PHONE_NUMBER_ID")

# Initialize Flask app and SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent", logger=True, engineio_logger=True)

# Set to keep track of connected user socket IDs
connected_users = set()
# Semaphore for thread-safe access to connected_users
users_lock = Semaphore()

# List of clients (mock data)
clients = [
    {"id": 1, "name": "Nilanthini", "whatsapp": "0771234567"},
    {"id": 2, "name": "Chamod", "whatsapp": "0777654321"},
    {"id": 3, "name": "Manoj", "whatsapp": "94763241208"},
]

def send_message(data):
    """
    Send a WhatsApp message using the Facebook Graph API.
    """
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

    logger.info(f"Sending message to {recipient_phone_number}: {body}")
    try:
        response = requests.post(url=url, headers=headers, json=payload)
        if response.status_code == 200:
            logger.info("✅ Message sent successfully")
        else:
            logger.error(f"❌ Failed to send message: {response.status_code} {response.text}")
        return response.json()
    except Exception as e:
        logger.exception(f"Exception occurred while sending message: {e}")
        return {"error": str(e)}
        

# Helper function to emit the list of currently connected users to all users
def emit_connected_users():
    with users_lock:
        users_list = [{"socketId": sid} for sid in connected_users]
    logger.info(f"Emitting connected users: {users_list}")
    socketio.emit("connected_users", users_list)

def send_response_message(data):
    """
    Parse and emit incoming WhatsApp messages from webhook data.
    """
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
        from_id = [client["id"] for client in clients if client["whatsapp"] == from_]
        content = message.get("text", {}).get("body", "")
        to = "self"
        time_stamp = message.get("timestamp", "")

        logger.info(f"Received WhatsApp message from {from_}: {content}")
        socketio.emit("receive_message", {
            "from": from_id[0] if from_id else None,
            "content": content,
            "to": to,
            "timestamp": time_stamp
        })
    else:
        logger.info("Message type is not text, ignoring.")

@app.route("/webhook", methods=["GET"])
def verify_webhook():
    """
    Endpoint to verify webhook with Facebook/WhatsApp.
    """
    if request.args.get("hub.mode") == "subscribe" and request.args.get("hub.verify_token") == WEBHOOK_VERIFY_TOKEN:
        logger.info("Webhook verified successfully")
        return request.args.get("hub.challenge"), 200
    else:
        logger.warning("Webhook verification failed")
        return "Verification failed", 403
    
@app.route("/webhook", methods=["POST"])
def handle_webhook():
    """
    Endpoint to handle incoming webhook events from WhatsApp.
    """
    data = request.json
    logger.info(f"Received webhook event: {data}")
    send_response_message(data)
    return "Webhook event received", 200

@app.route("/clients", methods=["GET"])
def get_clients():
    """
    Endpoint to get the list of clients.
    """
    logger.info("Client list requested")
    return {"clients": clients}

@app.route("/", methods=["GET"])
def index():
    """
    Root endpoint for health check or welcome message.
    """
    return "Welcome to the WhatsApp Chat Server! Checkout README.md for more details."


# Event handler for new user connection
@socketio.on("connect")
def handle_connect():
    """
    Handle new user connection to Socket.IO.
    """
    logger.info(f"User connected: {request.sid}")
    with users_lock:
        connected_users.add(request.sid)
    emit_connected_users()


# Event handler for user list request
@socketio.on("get_user_list")
def send_user_list(args):
    emit_connected_users()


# Event handler for client disconnection
@socketio.on("disconnect")
def handle_disconnect():
    """
    Handle user disconnection from Socket.IO.
    """
    with users_lock:
        connected_users.discard(request.sid)
    logger.info(f"User disconnected: {request.sid if hasattr(request, 'sid') else 'No SID'}")
    emit_connected_users()


# Event handler for receiving a message from a user
@socketio.on("send_message")
def handle_send_message(data):
    """
    Handle sending a message from a user to WhatsApp.
    """
    logger.info(f"Received send_message event: {data}")
    response = send_message(data)
    socketio.emit("send_message_response", response)

# Event handler for receiving a message from WhatsApp and forwarding to clients
@socketio.on("send_message_from_whatsapp")
def handle_send_message_from_whatsapp(data):
    logger.info(f"Received message from WhatsApp: {data}")
    socketio.emit("receive_message", {
        "from": data.get("from"),
        "content": data.get("content"),
        "to": data.get("to"),
        "timestamp": data.get("timestamp")
    })


# Entry point: run the server with gevent and WebSocket support
if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    logger.info(f"Starting Socket.IO server on ws://localhost:{PORT}")
    # Start the WSGI server with WebSocket handler
    server = pywsgi.WSGIServer(("0.0.0.0", int(PORT)), app, handler_class=WebSocketHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped by user.")
