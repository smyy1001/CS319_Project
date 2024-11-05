from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from app.utils import hash_password
from pydantic import UUID4
from typing import List
# used for reminding a return of empty list etc
import logging
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()

# NOTE : ACCEPT / REJECT INDIVIDUAL TOUR ENDPOINTS WONT BE INCLUDED, WE WON'T BE refusing INDIVIDUALS TO COME TO SEE US.
# NOTE : individuals cannot come everytime right? Not in night etc. So we just inform them, like
# "our guides will welcome you only in summer between 09.00-17.30, if thats ok, please sign up"
 
#TODO send form

#TODO show all

#TODO show

#TODO individual tours






