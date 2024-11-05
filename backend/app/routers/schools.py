from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
from app.utils import hash_password
import app.schemas as schemas
from typing import List
from datetime import datetime, timedelta
from pydantic import UUID4
# used for reminding a return of empty list etc
import logging
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()

# add school
@router.post("/add/", response_model=schemas.School)
def create_school(school: schemas.SchoolCreate, db: Session = Depends(get_db)):
    # check if the school exists (e.g., based on email or other unique field)
    db_school = (
        db.query(models.School).filter(models.School.email == school.email).first()
    )
    if db_school:
        raise HTTPException(status_code=400, detail="Bu email ile bir okul zaten var")
    
    #hashed_password = hash_password(school.password)
    db_school = models.School(
        **school.dict(exclude={"password"})
    )
    db.add(db_school)
    db.commit()
    db.refresh(db_school)
    return db_school




#delete school
@router.delete("/delete/{school_id}", response_model=schemas.School)
def delete_school(school_id: int, db: Session = Depends(get_db)):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if not db_school:
        raise HTTPException(status_code=404, detail="Okul bulunamadı")
    db.delete(db_school)
    db.commit()
    db.refresh(db_school)
    return db_school


#show all school
@router.get("/all/", response_model=List[schemas.School])
def get_all_schools(db: Session = Depends(get_db)):
    schools = db.query(models.School).all()
    return schools


# show school
@router.get("/show_school/{school_id}", response_model=schemas.School)
def show_school(school_id: UUID4, db: Session = Depends(get_db)):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if not db_school:
        raise HTTPException(
            status_code=404, detail=f"Okul id si {school_id} olan bir okul bulunamadı."
        )
    return db_school

# give rate
@router.post("/rate_school/{school_id}", response_model=schemas.School)
def give_rate(school_id: UUID4, school_rate: int, db: Session = Depends(get_db)):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if not db_school:
        raise HTTPException(
            status_code=404, detail=f"Okul id si {school_id} olan bir okul bulunamadı."
        )
    if school_rate < 1 or school_rate > 10:
        raise HTTPException(status_code=400, detail="Rate 1 ile 10 arasında olmalı.")

    db_school.rate = school_rate
    db.commit()
    db.refresh(db_school)
    return db_school

#TODO school info edit
@router.put("/edit/{school_id}", response_model=schemas.School)
def edit_school(
    school_id: UUID4, school: schemas.SchoolBase, db: Session = Depends(get_db)
):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if not db_school:
        raise HTTPException(status_code=404, detail=f"Bu id({school_id}) ile bir school bulunamadı.")
    for key, value in school.dict(exclude_unset=True).items():
        setattr(db_school, key, value)
    db.commit()  # Save changes
    db.refresh(db_school)  # refresh the school to get the update
    logging.debug(f"School with id {school_id} has been updated.")
    return db_school
