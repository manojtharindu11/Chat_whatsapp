from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from app.api.chat.routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    return app