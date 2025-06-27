from flask import Flask
from flask_cors import CORS
from app.utils.socket.socket import socketio

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)
    
    # Initialize socketio with the app
    socketio.init_app(app)
    
    # Import socket events
    from app.events import socket_events
    
    # Register blueprints if needed
    from app.api.chat.routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    return app