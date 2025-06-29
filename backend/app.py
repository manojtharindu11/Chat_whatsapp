from gevent import monkey
monkey.patch_all()

from flask import Flask, request
from flask_socketio import SocketIO
from gevent.lock import Semaphore  # gevent-safe lock

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent", logger=True, engineio_logger=True)

# Set to keep track of connected client socket IDs
connected_clients = set()
# Semaphore for thread-safe access to connected_clients
clients_lock = Semaphore()

# Event handler for new client connection
@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")
    with clients_lock:
        connected_clients.add(request.sid)
    emit_connected_clients()
    
@socketio.on("get_client_list")
def send_client_list(args):
    emit_connected_clients()

# Event handler for client disconnection
@socketio.on("disconnect")
def handle_disconnect():
    with clients_lock:
        connected_clients.discard(request.sid)
    print(f"Client disconnected: {request.sid if hasattr(request, 'sid') else 'No SID'}")
    emit_connected_clients()

# Event handler for receiving a message from a client
@socketio.on("send_message")
def handle_send_message(data):
    to_sid = data.get("to")
    if to_sid:
        # Send message to a specific client
        print(f"Sending message to {to_sid}: {data}")
        socketio.emit("receive_message", data, to=to_sid)
    else:
        # Broadcast message to all clients
        print(f"Broadcasting message: {data}")
        socketio.emit("receive_message", data)

# Helper function to emit the list of currently connected clients to all clients
def emit_connected_clients():
    with clients_lock:
        client_list = [{"socketId": sid} for sid in connected_clients]
    print(f"Emitting connected clients: {client_list}")
    socketio.emit("connected_clients", client_list)

# Entry point: run the server with gevent and WebSocket support
if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    print("Starting Socket.IO server on ws://localhost:5002")
    # Start the WSGI server with WebSocket handler
    server = pywsgi.WSGIServer(("0.0.0.0", 5002), app, handler_class=WebSocketHandler)
    server.serve_forever()
