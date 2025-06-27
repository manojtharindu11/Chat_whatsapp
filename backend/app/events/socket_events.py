from flask import request
from flask_socketio import join_room, leave_room

from app.utils.socket.socket import socketio
from app.services.chat_service import chat_service
from app.models.message import Message

@socketio.on("connect")
def handle_connect():
    """Handle client connection"""
    client_id = request.sid
    chat_service.add_client(client_id)
    join_room(client_id)
    print(f"Client connected: {client_id}")
    emit_connected_clients()

@socketio.on("disconnect")
def handle_disconnect():
    """Handle client disconnection"""
    client_id = request.sid
    chat_service.remove_client(client_id)
    leave_room(client_id)
    print(f"Client disconnected: {client_id}")
    emit_connected_clients()

@socketio.on("client_connected")
def handle_client_connected(data):
    """Handle client connected notification"""
    client_id = data.get('socketId')
    print(f"client_connected event from: {client_id}")
    if client_id and chat_service.is_client_connected(client_id):
        emit_connected_clients()

@socketio.on("send_message")
def handle_send_message(data):
    """Handle message sending between clients"""
    print(f"send_message event received: {data}")
    message = Message.from_dict(data)
    print(f"Parsed message: {message}")
    print(f"Connected clients: {chat_service.get_connected_clients()}")
    if message.to_id and chat_service.is_client_connected(message.to_id):
        print(f"Emitting to recipient room: {message.to_id}")
        socketio.emit("receive_message", message.to_dict(), room=message.to_id)
        
        # Also send to sender for real-time UI update
        if message.from_id and message.from_id != message.to_id:
            print(f"Emitting to sender room: {message.from_id}")
            socketio.emit("receive_message", message.to_dict(), room=message.from_id)
    else:
        print("Recipient not connected or no recipient specified. Broadcasting to all.")
        # Fallback: broadcast to all (not recommended for private chat)
        socketio.emit("receive_message", message.to_dict())

def emit_connected_clients():
    """Emit the list of connected clients to all clients"""
    client_list = chat_service.get_connected_clients()
    print(f"Emitting connected_clients: {client_list}")
    socketio.emit("connected_clients", client_list)
