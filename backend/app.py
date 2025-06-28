from gevent import monkey
monkey.patch_all()

from flask import Flask, request
from flask_socketio import SocketIO
from gevent.lock import Semaphore  # ✅ Use gevent-safe lock

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent", logger=True, engineio_logger=True)

connected_clients = set()
clients_lock = Semaphore()  # ✅ gevent-compatible lock

@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")
    with clients_lock:
        connected_clients.add(request.sid)
    emit_connected_clients()

@socketio.on("disconnect")
def handle_disconnect():
    with clients_lock:
        connected_clients.discard(request.sid)
    print(f"Client disconnected: {request.sid if hasattr(request, 'sid') else 'No SID'}")
    emit_connected_clients()
    
@socketio.on("send_message")
def handle_send_message(data):
    to_sid = data.get("to")

    if to_sid:
        print(f"Sending message to {to_sid}: {data}")
        socketio.emit("receive_message", data, to=to_sid)
    else:
        print(f"Broadcasting message: {data}")
        socketio.emit("receive_message", data)  # Optional: fallback broadcast
    
def emit_connected_clients():
    client_list = list(connected_clients)
    print(f"Emitting connected clients: {client_list}")
    socketio.emit("connected_clients", client_list)

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5002)
