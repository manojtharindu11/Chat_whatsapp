from flask import Flask
from app.utils.socket.socket import socketio

def create_app():
    app = Flask(__name__)
    
    socketio.init_app(app)
    
    from app.api.chat.routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    return app