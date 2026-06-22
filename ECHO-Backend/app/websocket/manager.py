"""WebSocket connection manager for real-time updates"""

from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time alerts"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, user_id: str):
        """Disconnect a WebSocket client"""
        if user_id in self.active_connections:
            if self.active_connections[user_id]:
                self.active_connections[user_id].pop()
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"User {user_id} disconnected")
    
    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        for user_id, connections in list(self.active_connections.items()):
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {user_id}: {str(e)}")
    
    async def broadcast_to_user(self, user_id: str, message: str):
        """Broadcast message to specific user's connections"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {user_id}: {str(e)}")
    
    async def broadcast_alert_update(self, alert_id: str, update_data: dict):
        """Broadcast alert update to all connected clients"""
        import json
        message = json.dumps({
            "type": "alert_update",
            "alert_id": alert_id,
            "data": update_data
        })
        
        await self.broadcast(message)
    
    async def broadcast_notification(self, user_id: str, notification_data: dict):
        """Broadcast notification to user"""
        import json
        message = json.dumps({
            "type": "notification",
            "data": notification_data
        })
        
        await self.broadcast_to_user(user_id, message)
    
    def get_active_user_count(self) -> int:
        """Get total number of active users"""
        return len(self.active_connections)
    
    def get_active_connection_count(self) -> int:
        """Get total number of active connections"""
        total = 0
        for connections in self.active_connections.values():
            total += len(connections)
        return total
