from fastapi import FastAPI, HTTPException, Body, Depends, APIRouter
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

# TODO get available guides for tour

# ? CALENDAR API
# TODO show active guides only
@router.get("/show_active", response_model=List[schemas.Guide])
def show_active(db: Session = Depends(get_db)):
    #get all the guides
    db_guides = db.query(models.Guide).filter(models.Guide.isactive == True).all()
    #if none found, just return []
    if not db_guides:
        logging.debug("active_guides is an empty list")

    return db_guides

# TODO show past guides only
@router.get("/show_past", response_model=List[schemas.Guide])
def show_past(db: Session = Depends(get_db)):
    #get all the guides
    db_guides = db.query(models.Guide).filter(models.Guide.isactive == False).all()
    #if none found, just return []
    if not db_guides:
        logging.debug("past_guides is an empty list")

    return db_guides


# add guides
# TESTED
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
# TESTED
@router.put("/edit_profile/{guide_id}", response_model=schemas.Guide)
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


# give rate
# TESTED
@router.post("/rate_guide/{guide_id}", response_model=schemas.Guide)
def give_rate(guide_id: UUID4, rate: int, db: Session = Depends(get_db)):
    
    db_guide = db.query(models.Guide).filter(models.Guide.user_id == guide_id).first()
    
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir guide bulunamadı."
        )

    if rate < 1 or rate > 10:
        raise HTTPException(status_code=400, detail="Rate 1 ile 10 arasında olmalı.")

    
    db_guide.total_ratings += 1
    db_guide.rating_sum += rate


    db_guide.guide_rating = db_guide.rating_sum / db_guide.total_ratings

    
    db.commit()
    db.refresh(db_guide)

    return db_guide

# show all guides, returns [] if not found.
# TESTED
# concern: sadece aktifleri mi gösterelim yoksa hepsini mi (şu an hepsini gösteriyor, diğer türlü sadece isActive filter ı yapıcaz, e.g. filter(models.Guide.isActive == True)
@router.get("/show_all_guides", response_model=List[schemas.Guide])
def show_all_guides(db: Session = Depends(get_db)):
    #get all the guides
    db_guide = db.query(models.Guide).all()
    #if none found, just return []
    if not db_guide:
        logging.debug("show_all_guides is an empty list")

    return db_guide

# show guide
# TESTED
@router.get("/show/{guide_id}", response_model=schemas.Guide)
def show(guide_id: UUID4, db: Session = Depends(get_db)):
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
# TESTED
@router.post("/rate/{guide_id}", response_model=schemas.Guide)
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


# remove guide
# TESTED
@router.delete("/delete/{guide_id}", response_model=schemas.Guide)
def delete_guide(guide_id: UUID4, db: Session = Depends(get_db)):
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Rehber bulunamadı")
    db.delete(db_guide)
    db.commit()
    return db_guide

# remove guide by email
@router.delete("/delete/email/{email}", response_model=schemas.Guide)
def delete_guide_with_email(email: str, db: Session = Depends(get_db)):
    db_guide = db.query(models.Guide).filter(models.Guide.email == email).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Rehber bulunamadı")
    db.delete(db_guide)
    db.commit()
    return db_guide

# show all guides
# TESTED
@router.get("/all/", response_model=List[schemas.Guide])
def get_all_guides(db: Session = Depends(get_db)):
    guides = db.query(models.Guide).all()
    return guides


@router.post("/make_advisor/{guide_id}", response_model=schemas.Advisor)
def make_advisor(
    guide_id: UUID4,
    advisor_data: schemas.AdvisorCreate = Body(...),
    db: Session = Depends(get_db),
):
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(status_code=404, detail="Rehber bulunamadı")

    db_guide_tours = db.query(models.GuideTour).filter(models.GuideTour.guide_id == guide_id).all()
    db_guide_fairs = db.query(models.GuideFair).filter(models.GuideFair.guide_id == guide_id).all()

    # Delete guide tours
    for guide_tour in db_guide_tours:
        db.delete(guide_tour)
    db.commit()

    # Delete guide fairs
    for guide_fair in db_guide_fairs:
        db.delete(guide_fair)
    db.commit()

    # Advisor objesi oluştur
    guide_data = {
        "id": db_guide.id,
        "name": db_guide.name,
        "user_id": db_guide.user_id,
        "email": db_guide.email,
        "phone": db_guide.phone,
        "username": db_guide.username,
        "responsible_day": advisor_data.days,
        "profile_picture_url": db_guide.profile_picture_url,
        "emergency_contact_name": db_guide.emergency_contact_name,
        "emergency_contact_phone": db_guide.emergency_contact_phone,
        "start_date": db_guide.start_date,
        "end_date": db_guide.end_date,
        "isactive": db_guide.isactive,
        "notes": db_guide.notes,
    }

    # Silmeden önce veriyi dön
    new_advisor = models.Advisor(**guide_data)

    db.delete(db_guide)
    db.commit()

    db.add(new_advisor)
    db.commit()
    db.refresh(new_advisor)

    return new_advisor  # Yeni advisor objesini döndür
