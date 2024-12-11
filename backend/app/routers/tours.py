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
# NOTE : THIS FILE MIGHT BE THE MOST IMPORTANT OUT OF ALL ROUTERS.
# NOTE : Adminler sudo/accept çağırırsa direk onay/ ret atabiliyor, admin/accept çağırırsa adviser onayı gerekiyor.
# Bunu şu yüzden yaptım, admin önce gelcek basacak bi tura onaya mesela (düz admin/accept kullanıp) "adviser henüz kabul etmemiş onaylamak istiyor musunuz" dedikten sonra evet derse "SUDO" kullanmış olacak


# ERROR RESOLVED (multiple requests for the same timestamp from the same highschool are not possible nows)
# send tour request
# TODO
@router.post("/send_tour_request/", response_model=schemas.Tour)
def send_tour_request(tour: schemas.TourCreate, db: Session = Depends(get_db)):

    #check if tour exists already with the given schooL-
    db_tours = db.query(models.Tour).filter(models.Tour.high_school_name == tour.high_school_name, models.Tour.date == tour.date).first()
    if db_tours:
        raise HTTPException(status_code=400, detail=f"Böyle bir tur zaten var, muhtemelen duplicate form atılmış.")

    #check if the tour date is at least 2 weeks after the current date
    current_date = datetime.now()
    if tour.date < current_date + timedelta(weeks=2):
        raise HTTPException(status_code=400, detail="Tur tarihi, formun gönderildiği tarihten en az 2 hafta sonra olmalıdır.")

    # Proceed with creating the tour if validations pass
    new_tour = models.Tour(**tour.dict())
    db.add(new_tour)
    db.commit()
    db.refresh(new_tour)
    return new_tour


# ADVISER accept tour request
# TESTED
# tourların default confirmation ı "PENDING" , adviser BTO ONAY ya da BTO RET yapıyor
# adviser accept, reject ve sonra Dilek Hoca accept reject edebiliyor, bunlara göre confirmation state değişiyor 4 tane metod ediyor her biri için
@router.post("/advisor/accept_tour/{tour_id}", response_model=schemas.Tour)
def adviser_accept_form(tour_id: int, feedback: str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    #if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    #if form is already confirmed or passed throw error
    if db_tour.confirmation != "PENDING": # error prone
        raise HTTPException(status_code=400, detail="Tur daha önceden değerlendirilmiş")
    #TODO > 60 sa error 
     
    # adviser accepts the form.
    db_tour.confirmation = "BTO ONAY"
    db_tour.feedback = feedback
     # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    return db_tour


# ADVISER reject tour request
# TESTED
# yukarıdakine baya benziyor sadece confirmation BTO RET oluyor
@router.post("/advisor/reject_tour/{tour_id}", response_model=schemas.Tour)
def adviser_reject_form(tour_id: int, feedback: str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    # if form is already confirmed or passed throw error
    if db_tour.confirmation != "PENDING": # error prone
        raise HTTPException(status_code=400, detail="Tur daha önceden değerlendirilmiş")

    # adviser rejects the form.
    db_tour.confirmation = "BTO RET"
    db_tour.feedback = feedback

    # commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur ret işlemi başarısız oldu")

    return db_tour


# ADMIN accept tour request
# TESTED
@router.post("/admin/accept_tour/{tour_id}", response_model=schemas.Tour)
def accept_tour(
    tour_id: int, feedback: str, db: Session = Depends(get_db)
):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # if form not found, throw error
    if not db_tour:
        raise HTTPException(
            status_code=400, detail=f"id'si = {tour_id} olan tur bulunamadı."
        )
    # if form is already confirmed or passed throw error
    if db_tour.confirmation != "BTO ONAY": # error prone
        raise HTTPException(status_code=400, detail="Turu adviser onaylamamış, ya da daha önce bir admin değerlendirmiş")

    # ADMIN accepts the form.
    db_tour.confirmation = "ONAY"
    db_tour.feedback = feedback
    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    return db_tour


# TODO ADMIN reject tour request
# TESTED
@router.post("/admin/reject_tour/{tour_id}", response_model=schemas.Tour)
def reject_tour(tour_id: int, feedback: str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    # if form is already confirmed or passed, throw error
    if db_tour.confirmation != "BTO RET" and db_tour.confirmation != "BTO ONAY": # both BTO RET and BTO ONAY are acceptable.
        raise HTTPException(status_code=400, detail="Turu adviser değerlendirmemiş, ya da daha önce bir admin değerlendirmiş.")

    # ADMIN rejects the form.
    db_tour.confirmation = "RET"
    db_tour.feedback = feedback
    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        logging.error(f"Error while rejecting tour: {e}")
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    logging.info(f"Tour with ID {tour_id} rejected successfully.")
    return db_tour


#  SUDO ACCEPT TOUR
#  TESTED
@router.post("/sudo/accept_tour/{tour_id}", response_model=schemas.Tour)
def sudo_accept_tour(tour_id: int, feedback: str , db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # if form not found, throw error
    if not db_tour:
        raise HTTPException(
            status_code=400, detail=f"id'si = {tour_id} olan tur bulunamadı."
        )
    # if form is already confirmed or passed throw error
    # DO IT ANYWAY

    # ADMIN accepts the form.
    db_tour.confirmation = "ONAY"
    db_tour.feedback = feedback
    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    return db_tour

# SUDO REJECT
# TESTED
@router.post("/sudo/reject_tour/{tour_id}", response_model=schemas.Tour)
def sudo_reject_tour(tour_id: int, feedback: str, db: Session = Depends(get_db)):
    # get the form  with id
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # if form not found, throw error
    if not db_tour:
        raise HTTPException(status_code=400, detail=f'id\'si = {tour_id} olan tur bulunamadı.')
    # if form is already confirmed or passed throw error
    # SUDO -> DO IT ANYWAY

    # ADMIN REJECTS the form.
    db_tour.confirmation = "RET"
    db_tour.feedback = feedback
    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)  
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        raise HTTPException(status_code=500, detail="Tur onaylama işlemi başarısız oldu")

    return db_tour


""" already exists in guides_fair.py 
 #show guide tours
 #see the guides's own tours, returns [] if not found
@router.get("/show_guide_tours/{guide_id}", response_model=List[schemas.Tour])
def show_guide_tours(guide_id: UUID4, db: Session = Depends(get_db)):
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

 """
# show all
# TESTED
# see the guides's own tours, returns [] if not found
@router.get("/all/", response_model=List[schemas.Tour])
def show_all_tours( db: Session = Depends(get_db)):
    # we get all the tour ids from the junction table.
    db_tours = (
        db.query(models.Tour)
        .all()
    )
    # check if anything exists
    if not db_tours:
        logging.debug("see own tours is empty")  # => maybe we can return "Burada henüz bir şey yok."
    return db_tours

# TESTED
# see the guides's own tours, returns [] if not found
@router.get("/show/{tour_id}", response_model=schemas.Tour)
def show_one_tour( tour_id: int, db: Session = Depends(get_db)):
    db_tour = (
        db.query(models.Tour).filter(models.Tour.id == tour_id)
        .first()
    )
    # check if anything exists
    if not db_tour:
        logging.debug("tour is not found")  # => maybe we can return "Burada henüz bir şey yok."
        raise HTTPException(status_code=404, detail=f"Verilen tour_id ={tour_id} ile eşleşen bir tour bulunamadı.")
    return db_tour

# TESTED
# NOTE  Call this function with 'date' specified! Otherwise will throw e
# see the guides's own tours, returns [] if not found
@router.patch("/edit/{tour_id}", response_model=schemas.Tour)
def edit_tour( tour_id: int, tour: schemas.TourBase, db: Session = Depends(get_db)):
    #find the tour
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    # check if anything exists
    if not db_tour:
        logging.debug("tour is not found")  # => maybe we can return "Burada henüz bir şey yok."
        raise HTTPException(status_code=404, detail=f"Verilen tour_id ={tour_id} ile eşleşen bir tour bulunamadı.")
    for key, value in tour.dict(exclude_unset=True).items():
        setattr(db_tour, key, value)
    
    # Commit the changes to the database
    try:
        db.commit()
        db.refresh(db_tour)
    except Exception as e:
        db.rollback()  # Roll back the session in case of an error
        logging.error(f"Error while updating tour: {e}")
        raise HTTPException(status_code=500, detail="Failed to update the tour.")
    
    logging.info(f"Tour with ID {tour_id} updated successfully.")
    return db_tour
