# models_user.py
from sqlalchemy import Column, Integer, String
from database_persona import Base

class Users(Base):
    __tablename__ = "users"  # Must match your main user table name

    # Ensure MySQL will auto-increment this primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    def __repr__(self):
        return f"<Users(id={self.id}, username='{self.username}')>"
