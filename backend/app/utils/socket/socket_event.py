from app.utils.socket.socket import socketio
from flask import request
from gevent.lock import Semaphore  # ✅ Use gevent-safe lock
import logging

logger = logging.getLogger(__name__)

connected_clients = set()
clients_lock = Semaphore()  # ✅ gevent-compatible lock

def emit_connected_clients():
    with clients_lock:
        client_list = list(connected_clients)
    logger.info(f"Emitting connected clients: {client_list}")
    socketio.emit("connected_clients", client_list)

@socketio.on("connect")
def handle_connect():
    with clients_lock:
        connected_clients.add(request.sid)
    logger.info(f"Client connected: {request.sid}")
    emit_connected_clients()

@socketio.on("disconnect")
def handle_disconnect():
    with clients_lock:
        connected_clients.discard(request.sid)
    logger.info(f"Client disconnected: {request.sid}")
    emit_connected_clients()

@socketio.on("send_message")
def handle_send_message(data):
    to_sid = data.get("to")
    logger.info(f"Received message: {data}")

    if to_sid:
        logger.info(f"Sending message to: {to_sid}")
        socketio.emit("receive_message", data, to=to_sid)
    else:
        logger.warning("No recipient specified. Broadcasting to all.")
        socketio.emit("receive_message", data)  # Optional: fallback broadcast