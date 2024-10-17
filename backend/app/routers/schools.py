from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
from app.utils import hash_password
import app.schemas as schemas
from typing import List
from datetime import datetime, timedelta
from pydantic import UUID4


router = APIRouter()


@router.post("/add/", response_model=schemas.School)
def create_school(school: schemas.SchoolCreate, db: Session = Depends(get_db)):
    # check if the school exists (e.g., based on email or other unique field)
    db_school = (
        db.query(models.School).filter(models.School.email == school.email).first()
    )
    if db_school:
        raise HTTPException(status_code=400, detail="Bu email ile bir okul zaten var")
    
    hashed_password = hash_password(school.password)
    db_school = models.School(
        **school.dict(exclude={"password"}), password=hashed_password
    )
    db.add(db_school)
    db.commit()
    db.refresh(db_school)
    return db_school


#for schools to send forms of tour requests
#sorunlara yol açabilir tehlikeli bi method sdfjksdf
# this will be specific for a Tour since the tour argument is of type: TourCreate not FairCreate etc
#CONCERNS- 
# there might be problems with the 'DATE' Issues, init.sql model ve schemas taki bütün date related ları date type ına çevirdim ama kaçırdığımm şeyler olabilir.  
# !!! CHECK OUT the filters !!! filterlarda lise ismini direk check ediyorum user input a bağımlı olabilir
# şunu okuyablirsiniz neden filtering yapmamız gerektiğiyle ilgili
""" Sometimes, schools submit multiple
applications with the intention of being
flexible on dates and times. Our system
doesn't always catch these duplicates """
@router.post("/send_tour_form/", response_model=schemas.Tour)
def send_form(tour: schemas.TourCreate, db: Session = Depends(get_db)):

    #check if tour exists already with the given schooL-
    db_tours = db.query(models.Tour).filter(models.Tour.high_school_name == tour.high_school_name, models.Tour.date == tour.date).first()
    if db_tours:
        raise HTTPException(status_code=400, detail="Böyle bir tur zaten var, muhtemelen duplicate form atılmış.")
    
    #check if the tour date is at least 2 weeks after the current date
    current_date = datetime.now().date()
    if tour.date < current_date + timedelta(weeks=2):
        raise HTTPException(status_code=400, detail="Tur tarihi, formun gönderildiği tarihten en az 2 hafta sonra olmalıdır.")

    # Proceed with creating the tour if validations pass
    new_tour = models.Tour(**tour.dict())
    db.add(new_tour)
    db.commit()
    db.refresh(new_tour)
    return new_tour
    


@router.delete("/delete/{school_id}", response_model=schemas.School)
def delete_school(school_id: int, db: Session = Depends(get_db)):
    db_school = db.query(models.School).filter(models.School.id == school_id).first()
    if not db_school:
        raise HTTPException(status_code=404, detail="Okul bulunamadı")
    db.delete(db_school)
    db.commit()
    db.refresh(db_school)
    return db_school


@router.get("/all/", response_model=List[schemas.School])
def get_all_schools(db: Session = Depends(get_db)):
    schools = db.query(models.School).all()
    return schools
