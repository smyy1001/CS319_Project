from fastapi import APIRouter, HTTPException, Depends, status
from passlib.context import CryptContext
import psycopg2
from psycopg2 import OperationalError
import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv
# from pydantic import UUID4
from uuid import UUID
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Security
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas

load_dotenv()
SECRET_KEY = os.getenv("SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def check_postgres_connection():
    try:
        connection = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DATABASE'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('DOCKER_POSTGRES_PORT'),
        )
        connection.close()
        return True
    except OperationalError as e:
        return str(e)


# Security
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt




def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    # if not user or password != user.password:
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_uuid = UUID(user_id) 
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_uuid).first()
    if user is None:
        raise credentials_exception
    return user
