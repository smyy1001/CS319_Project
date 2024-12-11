from fastapi import APIRouter, HTTPException, Depends, status
from passlib.context import CryptContext
import psycopg2
from psycopg2 import OperationalError
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from dotenv import load_dotenv
# from pydantic import UUID4
from uuid import UUID
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Security
import app.db.models as models
from app.deps import get_db
from pydantic import UUID4
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
    if not user:
        return False

    if not verify_password(password, user.password):
        return False
    
    role = 'guide'
    advisor = db.query(models.Advisor).filter(models.Advisor.user_id == user.id).first()

    if advisor:
        role = 'advisor'
    else:
        guide = db.query(models.Guide).filter(models.Guide.user_id == user.id).first()
        if guide:
            role = 'guide'
        else:
            school = db.query(models.School).filter(models.School.user_id == user.id).first()
            if school:
                role = 'school'
            else:
                role = 'admin'

    user.role = role

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


def sendEmail(subject, message, receiver_email):
    # Get credentials securely from environment variables (For now, hardcoded for example)
    email = "BilkentTO@gmail.com"

    # registera ekle confirmation_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    # Create a MIMEMultipart message object to handle both subject and body
    msg = MIMEMultipart()
    msg['From'] = email
    msg['To'] = receiver_email
    msg['Subject'] = subject

    # Create the email content with proper UTF-8 encoding
    msg.attach(MIMEText(message, 'plain', 'utf-8'))

    # Set up the SMTP server
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()

    try:
        # Login to the email server
        server.login(email, "dxnj cuqo xyim ooeu")

        # Send the email
        server.sendmail(email, receiver_email, msg.as_string())
        print("Email sent successfully!")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        server.quit()


def getDetails(
    db: Session, iid: UUID4
):
    temp = db.query(models.Guide).filter(models.Guide.user_id == iid).first()
    if not temp:
        temp = db.query(models.Advisor).filter(models.Advisor.user_id == iid).first()
        if not temp:
            temp = db.query(models.School).filter(models.School.user_id == iid).first()

    return temp
