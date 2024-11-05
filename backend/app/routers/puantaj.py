from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, APIRouter, Response
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

# delete all puantaj for a guide
#TESTED
@router.delete("/delete_all/{guide_id}", status_code=204)
def delete_all(guide_id: UUID4, db: Session = Depends(get_db)):
    all_puantaj = db.query(models.Puantaj).filter(models.Puantaj.guide_id == guide_id).all()
    if not all_puantaj:
        raise HTTPException(status_code=404, detail=f"(guide_id = {guide_id}) olan Puantaj bulunamadı")
    
    # doing the "Bulk Delete"(efficient way):
    # Store the puantaj records before deletion for returning
   
   #The copy() function in Python is typically used to create a shallow copy of a list,
    #deleted_puantaj = [puantaj for puantaj in all_puantaj]  
    # I have run into issues because I delete the Puantaj rows in the database but both copy() method and the for loop above would point to the deleted instance. Hence I couldnt return the instance for info purposes. Though it is possible to return it
    # Bulk delete all puantaj records in one query
    db.query(models.Puantaj).filter(models.Puantaj.guide_id == guide_id).delete(synchronize_session=False)
    
    
    """  # delete each puantaj in the list
    for puantaj in all_puantaj:
        db.delete(puantaj) """ # this method is not efficient
    db.commit()
    return Response(status_code=204) # shouldnt include: ,content = "Successfully deleted"   cause 204 -> no content

#TESTED
#delete puantaj
@router.delete("/delete/{puantaj_id}", response_model=schemas.Puantaj)
def delete_puantaj(puantaj_id: int, db: Session = Depends(get_db)):
    db_puantaj = db.query(models.Puantaj).filter(models.Puantaj.id == puantaj_id).first()
    if not db_puantaj:
        raise HTTPException(status_code=404, detail=f"Puantaj (puantaj id = {puantaj_id}) bulunamadı")
    db.delete(db_puantaj)
    db.commit()
    return db_puantaj

#TESTED
#TODO add puantaj
# -> burada farklı puantajları neye göre tarihe göre filan mı ayırmalıyız?
@router.post("/add/{guide_id}", response_model=schemas.Puantaj)
def add_puantaj(
    guide_id: UUID4,
    puantaj: schemas.PuantajBase,
    db: Session = Depends(get_db),
):
    
     # Create a new Puantaj object and assign the guide_id
    new_puantaj = models.Puantaj(**puantaj.dict())
    new_puantaj.guide_id = guide_id  # Set the guide_id
    
    # Add the new puantaj to the session
    db.add(new_puantaj)

    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(new_puantaj)
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Puantaj ekleme işlemi başarısız oldu.")

    return new_puantaj


# edit puantaj
# TESTED
@router.post("/edit/{guide_id}/{puantaj_id}", response_model=schemas.Puantaj)
def edit_puantaj(
    guide_id: UUID4,
    puantaj_id: int,
    puantaj: schemas.PuantajBase,
    db: Session = Depends(get_db),
):
    # is there any puantaj with the given guide id? If not, we have no puantaj to edit.
    db_puantaj = (
        db.query(models.Puantaj)
        .filter(models.Puantaj.id == puantaj_id, models.Puantaj.guide_id == guide_id)
        .first()
    )
    if not db_puantaj:
        raise HTTPException(
            status_code=404,
            detail="Verilen guide_id ve puantaj_id ile bir puantaj bulunamadı.",
        )
    for key, value in puantaj.dict(exclude_unset=True).items():
        setattr(db_puantaj, key, value)
    db.commit()
    db.refresh(db_puantaj)
    return db_puantaj



# shows guide's puantaj  , returns [] if no puantaj entered
# TESTED
@router.get("/show_guides_puantaj/{guide_id}", response_model=List[schemas.Puantaj])
def show_guides_puantaj(
    guide_id: UUID4,
    db: Session = Depends(get_db),
):
    # get the puantaj list of a guide with id = guide_id
    db_puantaj = (
        db.query(models.Puantaj)
        .filter(models.Puantaj.guide_id == guide_id)
        .all()
    )
    #if no puantaj values have been entered, returns an empty list
    if not db_puantaj:
        logging.debug(f'puantaj for the guide with guide_id = {guide_id} is an empty list')
    return db_puantaj


# TESTED
@router.get("/show/{puantaj_id}", response_model=schemas.Puantaj)
def show_puantaj(
    puantaj_id: int,
    db: Session = Depends(get_db),
):
    # get the puantaj list of a guide with id = guide_id
    db_puantaj = (
        db.query(models.Puantaj)
        .filter(models.Puantaj.id == puantaj_id)
        .first()
    )
    #if no puantaj values have been entered, returns an empty list
    if not db_puantaj:
        logging.error(f'puantaj (puantaj id = {puantaj_id} yok.)')
        raise HTTPException(status_code=404, detail=f"Puantaj with id {puantaj_id} not found.")

    return db_puantaj