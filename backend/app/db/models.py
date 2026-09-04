"""
CHRONOS-WS Database Base Models.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime, timezone
from app.db.database import Base

class SystemStatusLog(Base):
    __tablename__ = "system_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    service_name = Column(String(100), default="CHRONOS-WS")
    status = Column(String(50), default="OPERATIONAL")
    details = Column(Text, nullable=True)

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source_ip = Column(String(50))
    dest_ip = Column(String(50))
    protocol = Column(String(20))
    event_type = Column(String(50))
    severity = Column(String(20))
    payload_summary = Column(Text)
    is_decoy = Column(Boolean, default=False)
