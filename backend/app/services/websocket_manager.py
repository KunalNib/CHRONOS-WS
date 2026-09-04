"""
WebSocket connection manager for CHRONOS-WS Stage 14 Closed-Loop Adaptation.
Manages active WebSocket client connections and broadcasts real-time event updates across 10 event types:
1. telemetry_update
2. network_state_update
3. prediction_update
4. attack_path_update
5. objective_update
6. risk_update
7. defence_update
8. load_balancer_update
9. deception_update
10. feedback_update
"""

import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("CHRONOS-WS.WebSocketManager")


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accepts new WebSocket connection and adds to pool."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WEBSOCKET CONNECTED] Client connected. Total active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Removes disconnected WebSocket client from pool."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"[WEBSOCKET DISCONNECTED] Client removed. Total active clients: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Sends JSON message to specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")
            self.disconnect(websocket)

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcasts structured event message to all connected clients.
        Event types:
        telemetry_update | network_state_update | prediction_update | attack_path_update |
        objective_update | risk_update | defence_update | load_balancer_update |
        deception_update | feedback_update
        """
        message = {
            "event_type": event_type,
            "payload": data
        }

        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to client ({e}), queueing for disconnect.")
                disconnected_clients.append(connection)

        for dead_client in disconnected_clients:
            self.disconnect(dead_client)

    async def broadcast_json(self, data: Dict[str, Any]):
        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.warning(f"Failed to send JSON to client ({e}), queueing for disconnect.")
                disconnected_clients.append(connection)
        for dead_client in disconnected_clients:
            self.disconnect(dead_client)


# Global Singleton Instance
ws_manager = WebSocketManager()
