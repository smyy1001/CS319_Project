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


@router.post("/add/", response_model=schemas.Guide)
def create_guide(guide: schemas.GuideCreate, db: Session = Depends(get_db)):
    # check if the guide exists (e.g., based on email or other unique field)
    db_guide = db.query(models.Guide).filter(models.Guide.email == guide.email).first()
    if db_guide:
        raise HTTPException(
            status_code=400, detail="Bu email ile bir rehber zaten var."
        )

    # Hash the password before saving
    # hashed_password = hash_password(guide.password)

    # Create the guide with the hashed password
    db_guide = models.Guide(
        **guide.dict(exclude={"password"}))

    db.add(db_guide)
    db.commit()
    db.refresh(db_guide)
    return db_guide


# edit profile
@router.post("/edit_profile/{guide_id}", response_model=schemas.Guide)
def edit_profile(
    guide_id: UUID4, guide: schemas.GuideBase, db: Session = Depends(get_db)
):
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Bu id ile bir rehber bulunamadı.")
    for key, value in guide.dict(exclude_unset=True).items():
        setattr(db_guide, key, value)
    db.commit()  # Save changes
    db.refresh(db_guide)  # refresh the guide to get the update
    return db_guide


# shows guide's  puantaj list, returns [] if no puantaj entered
@router.get("/show_puantaj/{guide_id}", response_model=List[schemas.Puantaj])
def show_puantaj(
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
        return [] # puantaj değerleri girilmemiş, buraya raise error da denebilr
    return db_puantaj

# edit puantaj
@router.post("/edit_puantaj/{guide_id}/{puantaj_id}", response_model=schemas.Guide)
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

# give rate
@router.post("/rate_guide/{guide_id}", response_model=schemas.Guide)
def give_rate(guide_id: UUID4, rate: int, db: Session = Depends(get_db)):
    #get the guide
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    #check if guide does not exist
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir guide bulunamadı."
        )
        #check if the rate is correct
    if rate < 1 or rate > 10:
        raise HTTPException(status_code=400, detail="Rate 1 ile 10 arasında olmalı.")

    #update the rating
    db_guide.guide_rating = rate
    db.commit()
    db.refresh(db_guide)
    return db_guide

# show all guides, returns [] if not found.
# concern: sadece aktifleri mi gösterelim yoksa hepsini mi (şu an hepsini gösteriyor, diğer türlü sadece isActive filter ı yapıcaz, e.g. filter(models.Guide.isActive == True)
@router.get("/show_all_guides", response_model=List[schemas.Guide])
def show_all_guides(db: Session = Depends(get_db)):
    #get all the guides
    db_guide = db.query(models.Guide).all()
    #if none found, just return []
    if not db_guide:
        logging.debug("show_all_guides is an empty list")
        return [];

    return db_guide

@router.get("/show_guide/{guide_id}", response_model=schemas.Guide)
def show_guide(guide_id: UUID4, db: Session = Depends(get_db)):
    #get all the guides
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    #if none found, just return []
    if not db_guide:
        logging.debug("show_guide is empty")
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir guide bulunamadı."
        )

    return db_guide

# give rate
@router.post("/rate_guide/{guide_id}", response_model=schemas.Guide)
def give_rate(guide_id: UUID4, rate: int, db: Session = Depends(get_db)):
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir guide bulunamadı."
        )
    if rate < 1 or rate > 10:
        raise HTTPException(status_code=404, detail="Rate 1 ile 10 arasında olmalı.")

    db_guide.guide_rating = rate
    db.commit()
    db.refresh(db_guide)
    return db_guide


#request guideness



#see calendar

# see the guides's own tours, returns [] if not found
@router.get("/see_tours/{guide_id}", response_model=List[schemas.Tour])
def see_tours(guide_id: UUID4, db: Session = Depends(get_db)):
    # we get all the tour ids from the junction table.
    db_tours = (
        db.query(models.GuideTour.tour_id)
        .filter(models.GuideTour.guide_id == guide_id)
        .all()
    )
    # check if anything exists
    if not db_tours:
        logging.debug("see own tours is empty")
        return []  # => maybe we can return "Burada henüz bir şey yok."
        # raise HTTPException(status_code=401, detail="Verilen guide_id ile eşleşen bir tane bile tour bulunamadı. :)")
    # we need to convert the tour_ids into tours from Tours :) right now tours look like this => [(1,), (2,), (3,)]
    tour_ids = [tour_id[0] for tour_id in db_tours]  # [1,2,3]
    # now select the tours with corresponding tour_ids
    tours = db.query(models.Tour).filter(models.Tour.id.in_(tour_ids)).all()
    return tours


@router.delete("/delete/{guide_id}", response_model=schemas.Guide)
def delete_guide(guide_id: UUID4, db: Session = Depends(get_db)):
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Rehber bulunamadı")
    db.delete(db_guide)
    db.commit()
    return db_guide


@router.delete("/delete/email/{email}", response_model=schemas.Guide)
def delete_guide_with_email(email: str, db: Session = Depends(get_db)):
    db_guide = db.query(models.Guide).filter(models.Guide.email == email).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Rehber bulunamadı")
    db.delete(db_guide)
    db.commit()
    return db_guide


@router.get("/all/", response_model=List[schemas.Guide])
def get_all_guides(db: Session = Depends(get_db)):
    guides = db.query(models.Guide).all()
    return guides
