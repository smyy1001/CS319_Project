from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from pydantic import UUID4
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()



# NOTE: Similar to tours, the admin and adviser can approve or reject fairs. Admins have final authority.
# Send fair request
@router.post("/send_fair_request/", response_model=schemas.Fair)
def send_fair_request(fair: schemas.FairCreate, db: Session = Depends(get_db)):
    # Check if a fair with the same school and date already exists
    db_fairs = db.query(models.Fair).filter(models.Fair.high_school_name == fair.high_school_name, models.Fair.date == fair.date).first()
    if db_fairs:
        raise HTTPException(status_code=400, detail="Böyle bir fuar zaten var, muhtemelen duplicate form atılmış.")

    # Check if the fair date is at least 2 weeks after the current date
    current_date = datetime.now()
    if fair.date < current_date + timedelta(weeks=2):
        raise HTTPException(status_code=400, detail="Fuar tarihi, formun gönderildiği tarihten en az 2 hafta sonra olmalıdır.")

    # Proceed with creating the fair if validations pass
    new_fair = models.Fair(**fair.dict())
    db.add(new_fair)
    db.commit()
    db.refresh(new_fair)
    return new_fair



# ADVISER accept fair request
@router.post("/adviser/accept_fair/{fair_id}", response_model=schemas.Fair)
def adviser_accept_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')
    if db_fair.confirmation != "PENDING":
        raise HTTPException(status_code=400, detail="Fuar daha önceden değerlendirilmiş")

    # Adviser accepts the fair
    db_fair.confirmation = "BTO ONAY"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Fuar onaylama işlemi başarısız oldu")

    return db_fair

# ADVISER reject fair request
@router.post("/adviser/reject_fair/{fair_id}", response_model=schemas.Fair)
def adviser_reject_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')
    if db_fair.confirmation != "PENDING":
        raise HTTPException(status_code=400, detail="Fuar daha önceden değerlendirilmiş")

    # Adviser rejects the fair
    db_fair.confirmation = "BTO RET"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Fuar ret işlemi başarısız oldu")

    return db_fair

# ADMIN accept fair request
@router.post("/admin/accept_fair/{fair_id}", response_model=schemas.Fair)
def admin_accept_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')
    if db_fair.confirmation != "BTO ONAY":
        raise HTTPException(status_code=400, detail="Fuari adviser onaylamamış, ya da daha önce bir admin değerlendirmiş")

    # Admin accepts the fair
    db_fair.confirmation = "ONAY"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Fuar onaylama işlemi başarısız oldu")

    return db_fair

# ADMIN reject fair request
@router.post("/admin/reject_fair/{fair_id}", response_model=schemas.Fair)
def admin_reject_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')
    if db_fair.confirmation != "BTO RET" and db_fair.confirmation != "BTO ONAY":
        raise HTTPException(status_code=400, detail="Fuar'ı adviser değerlendirmemiş, ya da daha önce bir admin değerlendirmiş")

    # Admin rejects the fair
    db_fair.confirmation = "RET"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        logging.error(f"Error while rejecting fair: {e}")
        raise HTTPException(status_code=500, detail="Fuar ret işlemi başarısız oldu")

    logging.info(f"Fair with ID {fair_id} rejected successfully.")
    return db_fair

# SUDO accept fair request
@router.post("/sudo/accept_fair/{fair_id}", response_model=schemas.Fair)
def sudo_accept_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')

    # SUDO accepts the fair
    db_fair.confirmation = "ONAY"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Fuar onaylama işlemi başarısız oldu")

    return db_fair

# SUDO reject fair request
@router.post("/sudo/reject_fair/{fair_id}", response_model=schemas.Fair)
def sudo_reject_fair(fair_id: int, request: schemas.NotesUpdate, db: Session = Depends(get_db)):
    # Get the fair with id
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(status_code=400, detail=f'id\'si = {fair_id} olan fuar bulunamadı.')

    # SUDO rejects the fair
    db_fair.confirmation = "RET"
    db_fair.notes = request.notes
    try:
        db.commit()
        db.refresh(db_fair)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Fuar ret işlemi başarısız oldu")

    return db_fair



# Show all fairs
@router.get("/all/", response_model=List[schemas.Fair])
def show_all_fairs(db: Session = Depends(get_db)):
    db_fairs = db.query(models.Fair).all()
    if not db_fairs:
        logging.debug("No fairs available.")
    return db_fairs

# Show one fair by ID
@router.get("/show/{fair_id}", response_model=schemas.Fair)
def show_one_fair(fair_id: int, db: Session = Depends(get_db)):
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        logging.debug("Fair not found")
        raise HTTPException(status_code=404, detail="Fair not found")
    return db_fair


