from flask_socketio import SocketIO

# Create the SocketIO object with the appropriate configurations
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="gevent",          # Best for performance
    logger=True,
    engineio_logger=True,
    # ping_interval=5,             # How often the server pings the client
    # ping_timeout=10               # How long the client waits before considering the server dead
)