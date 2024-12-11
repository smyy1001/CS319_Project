from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from app.utils import hash_password
from pydantic import UUID4
from typing import List
import logging
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()

#add adviser
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

#remove adviser
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

#TODO show adviser with id
#show adviser
@router.get("/show/{adviser_id}", response_model=schemas.Advisor)
def show_adviser(adviser_id: UUID4, db: Session = Depends(get_db)):
    #get all the advisers
    db_adviser = db.query(models.Advisor).filter(models.Advisor.id == adviser_id).first()
   
    if not db_adviser:
        logging.debug("advisor is not found.")
        raise HTTPException(
            status_code=404, detail=f"Verilen advisor_id = {adviser_id} ile bir adviser bulunamadı."
        )

    return db_adviser




#show all advisers
@router.get("/all/", response_model=List[schemas.Advisor])
def get_all_advisors(db: Session = Depends(get_db)):
    advisors = db.query(models.Advisor).all()
    return advisors



#TODO edit adviser
@router.put("/edit/{adviser_id}", response_model=schemas.Advisor)
def edit_profile(
    adviser_id: UUID4, adviser: schemas.AdvisorBase, db: Session = Depends(get_db)
):
    db_advisor = db.query(models.Advisor).filter(models.Advisor.id == adviser_id).first()
    if not db_advisor:
        raise HTTPException(status_code=404, detail=f"Bu id({adviser_id}) ile bir adviser bulunamadı.")
    for key, value in adviser.dict(exclude_unset=True).items():
        setattr(db_advisor, key, value)
    db.commit()  # Save changes
    db.refresh(db_advisor)  # refresh the adviser to get the update
    logging.debug(f"Adviser with id {adviser_id} has been updated.")
    return db_advisor






