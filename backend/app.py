from app import create_app  
from app.utils.socket.socket import socketio

app = create_app()

if __name__ == '__main__':
    # Run the Flask app with socketio support
    socketio.run(app, port=5002, host='0.0.0.0', debug=True)