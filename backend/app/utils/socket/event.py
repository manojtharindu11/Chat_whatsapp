from app.utils.socket.socket import socketio
from flask import request

@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")