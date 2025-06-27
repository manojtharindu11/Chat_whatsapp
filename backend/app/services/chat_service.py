from threading import Lock
from typing import Dict, List, Set

class ChatService:
    def __init__(self):
        self._connected_clients: Set[str] = set()
        self._clients_lock = Lock()

    def add_client(self, client_id: str) -> None:
        """Add a new client to the connected clients list"""
        with self._clients_lock:
            self._connected_clients.add(client_id)

    def remove_client(self, client_id: str) -> None:
        """Remove a client from the connected clients list"""
        with self._clients_lock:
            self._connected_clients.discard(client_id)

    def get_connected_clients(self) -> List[Dict[str, str]]:
        """Get a list of all connected clients"""
        with self._clients_lock:
            return [{"socketId": sid} for sid in self._connected_clients]

    def is_client_connected(self, client_id: str) -> bool:
        """Check if a client is connected"""
        with self._clients_lock:
            return str(client_id) in self._connected_clients

# Create a singleton instance
chat_service = ChatService()
