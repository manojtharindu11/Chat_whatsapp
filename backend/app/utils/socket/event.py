from app.utils.socket.socket import socketio
from flask import request
from threading import Lock
from flask_socketio import join_room, leave_room

connected_clients = set()
clients_lock = Lock()

@socketio.on("connect")
def handle_connect():
    with clients_lock:
        connected_clients.add(request.sid)
    join_room(request.sid)
    print(f"Client connected: {request.sid}")
    emit_connected_clients()

@socketio.on("disconnect")
def handle_disconnect():
    with clients_lock:
        connected_clients.discard(request.sid)
    leave_room(request.sid)
    print(f"Client disconnected: {request.sid}")
    emit_connected_clients()

@socketio.on("client_connected")
def handle_client_connected(data):
    # Optionally handle client metadata here
    pass

@socketio.on("send_message")
def handle_send_message(data):
    to_sid = data.get("to")
    from_sid = data.get("from")
    if to_sid:
        # Send to recipient
        socketio.emit("receive_message", data, room=to_sid)
        # Also send to sender for real-time UI update
        if from_sid and from_sid != to_sid:
            socketio.emit("receive_message", data, room=from_sid)
    else:
        # fallback: broadcast to all (not recommended for private chat)
        socketio.emit("receive_message", data)

def emit_connected_clients():
    # Send the list of connected client socket IDs to all clients
    with clients_lock:
        client_list = [{"socketId": sid} for sid in connected_clients]
    socketio.emit("connected_clients", client_list)