from flask import Flask
from flask_cors import CORS
from app.utils.socket.socket import socketio

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)
    
    # Initialize socketio with the app
    socketio.init_app(app)

    return app