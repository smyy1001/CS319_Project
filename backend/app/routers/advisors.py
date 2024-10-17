from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from app.utils import hash_password
from pydantic import UUID4
from typing import List


router = APIRouter()


@router.post("/add/", response_model=schemas.Advisor)
def create_advisor(advisor: schemas.AdvisorCreate, db: Session = Depends(get_db)):
    # check if the advisor exists (e.g., based on email or other unique field)
    db_advisor = (
        db.query(models.Advisor).filter(models.Advisor.email == advisor.email).first()
    )
    if db_advisor:
        raise HTTPException(
            status_code=400, detail="Bu email ile bir rehber zaten var."
        )

    # Hash the password before saving
    # hashed_password = hash_password(advisor.password)

    db_advisor = models.Advisor(**advisor.dict(exclude={"password"}))

    db.add(db_advisor)
    db.commit()
    db.refresh(db_advisor)
    return db_advisor


# CONCERNS
# tourların default confirmation ı "PENDING" olmalı

# adviser accept, reject ve Dilek Hoca accept reject edebiliyor, bunlara göre confirmation state değişiyor 4 tane metod ediyor her biri için
# bütün bunlar sadece tour için bi de, id ler unique değil dolayısıyla ortak alırsak bilemiyoruz hangisi olduğunu, bu da tour ya da indiv.tour ya da fairs yani 3 durum demek
# 12 farklı metod oluyor herhangi bir efficiency önerisi olan var mı

#ayrıca confirmation ları string olarka check etmek baya Error Prone duruyor. confirmation == "PENDING" gibi.

# notes adviser'ın Dilek hocaya attığı not gibi bişi
@router.post("/accept_tour/{tour_id}", response_model=schemas.Tour)
def accept_form(tour_id: UUID4, notes:str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    #if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    #if form is already confirmed or passed throw error
    if db_tour.confirmation != "PENDING": # error prone
        raise HTTPException(status_code=400, detail="Tur daha önceden değerlendirilmiş")
     
    # adviser accepts the form.
    db_tour.confirmation = "BTO ONAY"
    db_tour.notes = notes
     # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    return db_tour

# yukarıdakine baya benziyor sadece confirmation BTO RET oluyor
@router.post("/reject_tour/{tour_id}", response_model=schemas.Tour)
def accept_form(tour_id: UUID4, notes:str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    #if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    #if form is already confirmed or passed throw error
    if db_tour.confirmation != "PENDING": # error prone
        raise HTTPException(status_code=400, detail="Tur daha önceden değerlendirilmiş")
     
    # adviser rejects the form.
    db_tour.confirmation = "BTO RET"
    db_tour.notes = notes
    
     # commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur ret işlemi başarısız oldu")

    return db_tour


@router.delete("/delete/{advisor_id}", response_model=schemas.Advisor)
def delete_advisor(advisor_id: UUID4, db: Session = Depends(get_db)):
    db_advisor = (
        db.query(models.Advisor).filter(models.Advisor.id == advisor_id).first()
    )
    if not db_advisor:
        raise HTTPException(status_code=404, detail="Danışman bulunamadı")
    db.delete(db_advisor)
    db.commit()
    return db_advisor


@router.get("/all/", response_model=List[schemas.Advisor])
def get_all_advisors(db: Session = Depends(get_db)):
    advisors = db.query(models.Advisor).all()
    return advisors
