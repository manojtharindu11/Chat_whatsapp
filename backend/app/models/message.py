from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Any

@dataclass
class Message:
    content: str
    from_id: str
    to_id: str
    timestamp: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Message':
        # Accept both string and datetime for timestamp
        ts = data.get('timestamp')
        if isinstance(ts, datetime):
            timestamp = ts
        elif isinstance(ts, str):
            try:
                timestamp = datetime.fromisoformat(ts)
            except Exception:
                timestamp = datetime.now()
        else:
            timestamp = datetime.now()
        return cls(
            content=data.get('content', ''),
            from_id=data.get('from', ''),
            to_id=data.get('to', ''),
            timestamp=timestamp
        )

    def to_dict(self) -> dict:
        return {
            'content': self.content,
            'from': self.from_id,
            'to': self.to_id,
            'timestamp': self.timestamp.isoformat()
        }
