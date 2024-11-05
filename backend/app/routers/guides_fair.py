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


#written by CHAT GPT with guides_tours.py given

# Request guidance for assigning guides to specific fairs
# NOTE: turns assign's status to 'REQUESTED'. NOTE: status can only take "REQUESTED" or "NONE"
@router.post("/request_guideness/{guide_id}/{fair_id}", response_model=schemas.GuideFair)
def request_guidance(guide_id: UUID4, fair_id: int, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir rehber bulunamadı."
        )
    # Check if fair exists
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(
            status_code=404, detail="Verilen fair_id ile bir fuar bulunamadı."
        )    
    # Check if the guide has already been assigned or requested for the task 
    db_guidefair = db.query(models.GuideFair).filter(models.GuideFair.guide_id == guide_id, models.GuideFair.fair_id == fair_id).first()
    if db_guidefair and (db_guidefair.status == "REQUESTED"):
        raise HTTPException(
            status_code=409, detail=f"Bu rehber (id = {guide_id}) bu fuara (id = {fair_id}) zaten request vermiş."
        )
    # If fair status is not "PENDING", it means the adviser has already processed it
    if (db_fair.confirmation != "PENDING"):
        raise HTTPException(
            status_code=409, detail=f"Bu fuar (id = {fair_id}) istek atmaya açık değil, durumu {db_fair.confirmation}."
        )      
    
    # If everything works correctly, assign the guide to the fair
    new_request = models.GuideFair(guide_id=guide_id, fair_id=fair_id, status="REQUESTED") 
   
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


# Assign guides to specific fairs
# NOTE: turns assign's status to 'ASSIGNED'. NOTE: status can only take "REQUESTED" or "NONE"
@router.post("/assign_guide/{guide_id}/{fair_id}", response_model=schemas.GuideFair)
def assign_guides(guide_id: UUID4, fair_id: int, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir rehber bulunamadı."
        )
    # Check if fair exists
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(
            status_code=404, detail="Verilen fair_id ile bir fuar bulunamadı."
        )    
    # Check if the guide has already been assigned to the task 
    db_guidefair = db.query(models.GuideFair).filter(models.GuideFair.guide_id == guide_id, models.GuideFair.fair_id == fair_id).first()
    if db_guidefair and (db_guidefair.status == "ASSIGNED"):
        raise HTTPException(
            status_code=409, detail="Bu rehbere bu fuar zaten verilmiş."
        )
    
    # If guide-fair status is REQUESTED, update it to ASSIGNED
    if db_guidefair and db_guidefair.status == "REQUESTED":
        db_guidefair.status = "ASSIGNED"
        db.commit()
        db.refresh(db_guidefair)
        return db_guidefair
    
    # If everything works correctly, now we can assign the guide to the fair
    new_assign = models.GuideFair(guide_id=guide_id, fair_id=fair_id, status="ASSIGNED") 
   
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)
    
    # Delete all other requests for the same fair that are not from the current guide
    db.query(models.GuideFair).filter(
        models.GuideFair.fair_id == fair_id,
        models.GuideFair.status == "REQUESTED",
        models.GuideFair.guide_id != guide_id
    ).delete()
    
    db.commit()  # Commit the deletion
    return new_assign


# Show guide assignments
@router.get("/show_guide_assigns/{guide_id}/", response_model=List[schemas.Fair])
def show_assigned_guides(guide_id: UUID4, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # Get the guide's fairs
    db_fairs = db.query(models.Fair).join(models.GuideFair).filter(models.GuideFair.guide_id == guide_id, models.GuideFair.status == "ASSIGNED").all()
    
    if not db_fairs:
        logging.debug(f"guide with id = {guide_id} has NO ASSIGNED fairs.")
    
    return db_fairs


# Show guide requests
@router.get("/show_guide_requests/{guide_id}/", response_model=List[schemas.Fair])
def show_guide_requests(guide_id: UUID4, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # Get the guide's fairs
    db_fairs = db.query(models.Fair).join(models.GuideFair).filter(models.GuideFair.guide_id == guide_id, models.GuideFair.status == "REQUESTED").all()
    
    if not db_fairs:
        logging.debug(f"guide with id = {guide_id} has NO REQUESTED fairs.")
    
    return db_fairs


# Show upcoming fairs for guides
@router.get("/upcoming_fairs/{guide_id}/", response_model=List[schemas.Fair])
def upcoming_fairs(guide_id: UUID4, db: Session = Depends(get_db)):
    current_datetime = datetime.now()
    
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    
    upcoming_fairs = (
        db.query(models.Fair)
        .join(models.GuideFair)
        .filter(models.GuideFair.guide_id == guide_id, models.GuideFair.status == "ASSIGNED", models.Fair.date > current_datetime)
        .all()
    )
    
    if not upcoming_fairs:
        logging.debug(f"guide with id = {guide_id} has no future fairs.")
    
    return upcoming_fairs


# Show past fairs for guides
@router.get("/past_fairs/{guide_id}/", response_model=List[schemas.Fair])
def past_fairs(guide_id: UUID4, db: Session = Depends(get_db)):
    current_datetime = datetime.now()
    
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    
    past_fairs = (
        db.query(models.Fair)
        .join(models.GuideFair)
        .filter(models.GuideFair.guide_id == guide_id, models.GuideFair.status == "ASSIGNED", models.Fair.date < current_datetime)
        .all()
    )
    
    if not past_fairs:
        logging.debug(f"guide with id = {guide_id} has no past fairs.")
    
    return past_fairs


# Show all fairs assigned to a guide 
@router.get("/all/{guide_id}/", response_model=List[schemas.Fair])
def show_guide_all_fairs(guide_id: UUID4, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  

    # Retrieve all fairs assigned to the guide
    assigned_fairs = (
        db.query(models.Fair)
        .join(models.GuideFair)
        .filter(models.GuideFair.guide_id == guide_id, models.GuideFair.status == "ASSIGNED")
        .all()
    )
    
    # Check if the guide has no assigned fairs
    if not assigned_fairs:
        logging.debug(f"Rehber (id = {guide_id}) için atanan fuar bulunamadı.")
    
    return assigned_fairs

# show all fairs for a specific guide
@router.get("/show_all_fairs/{guide_id}/", response_model=List[schemas.Fair])
def show_all_fairs(guide_id: UUID4, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # get all fairs associated with the guide, both REQUESTED and ASSIGNED
    all_fairs = (
        db.query(models.Fair)
        .join(models.GuideFair)
        .filter(models.GuideFair.guide_id == guide_id)
        .all()
    )
    
    # empty listse log gönderiyoruz
    if not all_fairs:
        logging.debug(f"guide with id = {guide_id} has no associated fairs.")
    
    return all_fairs


# TODO cancel a guide's requested fair
@router.delete("/cancel_guides_requested_fair/{guide_id}/{fair_id}")
def cancel_requested_fair(guide_id: UUID4, fair_id: int, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # check if fair exists
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(
            status_code=404, detail=f"Verilen fair_id (id = {fair_id}) ile bir fuar bulunamadı."
        )
    # find the guide-fair request
    db_guidefair = db.query(models.GuideFair).filter(
        models.GuideFair.guide_id == guide_id, 
        models.GuideFair.fair_id == fair_id
    ).first()
    
    if not db_guidefair or db_guidefair.status != "REQUESTED":
        raise HTTPException(
            status_code=404, detail=f"Rehber (id = {guide_id}) için bu fuar (id = {fair_id}) talep edilmemiş."
        )
    
    # delete the guide-fair request from the table
    db.delete(db_guidefair)
    db.commit()
    
    return {"detail": "Fuar talebi başarıyla iptal edildi."}


# TODO cancel a guide's assigned fair
@router.delete("/cancel_guides_assigned_fair/{guide_id}/{fair_id}")
def cancel_assigned_fair(guide_id: UUID4, fair_id: int, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # check if fair exists
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(
            status_code=404, detail=f"Verilen fair_id (id = {fair_id}) ile bir fuar bulunamadı."
        )
    # find the guide-fair assignment
    db_guidefair = db.query(models.GuideFair).filter(
        models.GuideFair.guide_id == guide_id, 
        models.GuideFair.fair_id == fair_id
    ).first()
    
    if not db_guidefair or db_guidefair.status != "ASSIGNED":
        raise HTTPException(
            status_code=404, detail=f"Rehber (id = {guide_id}) için bu fuar (id = {fair_id}) atanmış değil."
        )
    
    # delete the guide-fair assignment from the table
    db.delete(db_guidefair)
    db.commit()
    
    return {"detail": "Atama başarıyla iptal edildi."}

@router.delete("/delete_fair_request/{guide_id}/{fair_id}")
def delete_fair_request(guide_id: UUID4, fair_id: int, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # check if fair exists
    db_fair = db.query(models.Fair).filter(models.Fair.id == fair_id).first()
    if not db_fair:
        raise HTTPException(
            status_code=404, detail=f"Verilen fair_id (id = {fair_id}) ile bir fuar bulunamadı."
        )
    # find the guide-fair request
    db_guidefair = db.query(models.GuideFair).filter(models.GuideFair.guide_id == guide_id, models.GuideFair.fair_id == fair_id).first()
    if not db_guidefair:
        raise HTTPException(
            status_code=404, detail=f"Rehber (id = {guide_id}) için bu fuar (id = {fair_id}) talebi bulunamadı."
        )
    
    # delete the request
    db.delete(db_guidefair)
    db.commit()
    
    return {"detail": "Fuar talebi başarıyla silindi."}