from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)

    # Feature used
    feature = Column(String, nullable=False)

    # Study time tracked
    minutes = Column(Integer, default=0)

    # Optional subject tracking
    subject = Column(String, default="General")

    # Optional AI mode tracking
    ai_mode = Column(String, default="Academic")

    # Optional user action
    action = Column(String, default="Used Feature")

    # Timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    def __repr__(self):
        return (
            f"<Analytics(feature={self.feature}, "
            f"minutes={self.minutes}, "
            f"subject={self.subject})>"
        )