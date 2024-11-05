from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from app.utils import hash_password
from pydantic import UUID4
from typing import List


router = APIRouter()

#TODO add admin

#TODO delete admin

#TODO edit admin

#TODO show admin

#TODO admin show all





