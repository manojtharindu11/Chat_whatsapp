from flask_socketio import SocketIO
import os

# Get CORS_ALLOWED_ORIGINS from environment variable and split it into a list
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "*")
if cors_origins != "*":
    CORS_ALLOWED_ORIGINS = cors_origins.split(",")
else:
    CORS_ALLOWED_ORIGINS = "*"

# Create the SocketIO object with the appropriate configurations
socketio = SocketIO(
    cors_allowed_origins=CORS_ALLOWED_ORIGINS,
    async_mode="gevent",          # Best for performance
    logger=True,
    engineio_logger=True,
    ping_interval=5,             # How often the server pings the client
    ping_timeout=10               # How long the client waits before considering the server dead
)