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


# request guideness
# assign guides to specific tours, 
# NOTE turns assign's status to 'REQUESTED'. NOTE REMEMBER status can only take "REQUESTED" or "NONE"
@router.post("/request_guideness/{guide_id}/{tour_id}", response_model=schemas.GuideTour)
def request_guideness(guide_id: UUID4, tour_id: int, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir rehber bulunamadı."
        )
    #check if tour exists
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not db_tour:
        raise HTTPException(
            status_code=404, detail="Verilen tour_id ile bir tur bulunamadı." # 400 = bad request, 404 not fount
        )    
    #check if the guide has already been assigned, or requested to the task 
    db_guidetour = db.query(models.GuideTour).filter(models.GuideTour.guide_id == guide_id, models.GuideTour.tour_id == tour_id).first()
    # zaten request atmışsa
    if db_guidetour and (db_guidetour.status == "REQUESTED"):
        raise HTTPException(
            status_code=409, detail=f"Bu rehber (id = {guide_id}) bu tura (id = {tour_id}) zaten request vermiş." # 409 = conflict
        )
    # tur zaten işleme alınmışsa, ret ya da onay almışsa yani.
    if (db_tour.confirmation != "PENDING"): # tur 'PENDING' değilse adviser zaten işlemiş demektir, guide a açık değildir.
        raise HTTPException(
            status_code=409, detail=f"Bu tur (id = {tour_id})  istek atmaya açık değil, durumu {db_tour.confirmation}" # 409 = conflict
        )      
    #if eveything works correctly, now we can assign the guide to the tour (add these values to the GuideTour)
    new_request = models.GuideTour(guide_id = guide_id,tour_id =tour_id, status = "REQUESTED") 
   
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

# TODO cancel a guide's assigned tour
@router.delete("/cancel_guides_assigned_tour/{guide_id}/{tour_id}")
def cancel_assigned_tour(guide_id: UUID4, tour_id: int, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # check if tour exists
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not db_tour:
        raise HTTPException(
            status_code=404, detail=f"Verilen tour_id (id = {tour_id}) ile bir tur bulunamadı."
        )
    # find the guide-tour assignment
    db_guidetour = db.query(models.GuideTour).filter(
        models.GuideTour.guide_id == guide_id, 
        models.GuideTour.tour_id == tour_id
    ).first()
    
    if not db_guidetour or db_guidetour.status != "ASSIGNED":
        raise HTTPException(
            status_code=404, detail=f"Rehber (id = {guide_id}) için bu tur (id = {tour_id}) atanmış değil."
        )
    
    # delete the guide-tour assignment from the table
    db.delete(db_guidetour)
    db.commit()
    
    return {"detail": "Atama başarıyla iptal edildi."}


# TODO cancel a guide's requested tour
@router.delete("/cancel_guides_requested_tour/{guide_id}/{tour_id}")
def cancel_requested_tour(guide_id: UUID4, tour_id: int, db: Session = Depends(get_db)):
    # check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # check if tour exists
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not db_tour:
        raise HTTPException(
            status_code=404, detail=f"Verilen tour_id (id = {tour_id}) ile bir tur bulunamadı."
        )
    # find the guide-tour request
    db_guidetour = db.query(models.GuideTour).filter(
        models.GuideTour.guide_id == guide_id, 
        models.GuideTour.tour_id == tour_id
    ).first()
    
    if not db_guidetour or db_guidetour.status != "REQUESTED":
        raise HTTPException(
            status_code=404, detail=f"Rehber (id = {guide_id}) için bu tur (id = {tour_id}) talep edilmemiş."
        )
    
    # delete the guide-tour request from the table
    db.delete(db_guidetour)
    db.commit()
    
    return {"detail": "Tur talebi başarıyla iptal edildi."}



# assign guides to specific tours, 
# NOTE turns assign's status to 'ASSIGNED'. NOTE REMEMBER status can only take "REQUESTED" or "NONE"
@router.post("/assign_guide/{guide_id}/{tour_id}", response_model=schemas.GuideTour)
def assign_guides(guide_id: UUID4, tour_id: int, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail="Verilen guide_id ile bir rehber bulunamadı."
        )
    #check if tour exists
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not db_tour:
        raise HTTPException(
            status_code=404, detail="Verilen tour_id ile bir tur bulunamadı." # 400 = bad request, 404 not fount
        )    
    #check if the guide has already been assigned to the task 
    db_guidetour = db.query(models.GuideTour).filter(models.GuideTour.guide_id == guide_id,models.GuideTour.tour_id == tour_id).first()
    if db_guidetour and (db_guidetour.status == "ASSIGNED"): # guide-tour zaten varsa ve 'ASSIGNED' sa hata vermeli. NOTE : eğer 'REQUESTED' sa gerek yok, 
        raise HTTPException(
            status_code=409, detail="Bu rehbere bu tur zaten verilmiş." # 409 = conflict
        )
    
     # If guide-tour status is REQUESTED, update it to ASSIGNED
    if db_guidetour and db_guidetour.status == "REQUESTED":
        db_guidetour.status = "ASSIGNED"
        db.commit()
        db.refresh(db_guidetour)
        return db_guidetour
    
    # if eveything works correctly, now we can assign the guide to the tour (add these values to the GuideTour)
    new_assign = models.GuideTour(guide_id = guide_id,tour_id =tour_id, status = "ASSIGNED") 
    
        
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)
    
    # Assign'landıktan sonra kalan bütün requestleri silsek daha mı iyi olur? 
    # TODO
    db.query(models.GuideTour).filter(
        models.GuideTour.tour_id == tour_id,
        models.GuideTour.status == "REQUESTED",
        models.GuideTour.guide_id != guide_id  # Exclude the current guide
    ).delete()
    
    db.commit()  # Commit the deletion
    return new_assign





# TODO show guide assigns
# gets the pairs with guide_id AND "ASSIGNED" status in GuideTour table.
@router.get("/show_guide_assigns/{guide_id}/", response_model=List[schemas.Tour])
def show_assigned_guides(guide_id: UUID4, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # get the guide's tours
    db_tours = db.query(models.Tour).join(models.GuideTour).filter(models.GuideTour.guide_id == guide_id,models.GuideTour.status== "ASSIGNED").all()
    # empty listse log gönderiyoruz
    if not db_tours:
        logging.debug(f"guide with id = {guide_id} has NO ASSIGNED tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return db_tours



#ON IT
# TODO show guide requests
# gets the pairs with guide_id AND "REQUESTED" status in GuideTour table.
@router.get("/show_guide_requests/{guide_id}/", response_model=List[schemas.Tour])
def show_guide_requests(guide_id: UUID4, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # get the guide's tours
    db_tours = db.query(models.Tour).join(models.GuideTour).filter(models.GuideTour.guide_id == guide_id,models.GuideTour.status== "REQUESTED").all()
    # empty listse log gönderiyoruz
    if not db_tours:
        logging.debug(f"guide with id = {guide_id} has NO REQUESTED tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return db_tours



# TODO show UPCOMING (Guide-Tour) Combinations
# guides UPCOMING tours
@router.get("/upcoming_tours/{guide_id}/", response_model=List[schemas.Tour])
def upcoming_tours(guide_id: UUID4, db: Session = Depends(get_db)):
    #şu anki zamanı aldık
    current_datetime = datetime.now()
    
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # sadece gelecekteki turları alıyoruz  : NOTE (models.Tour.date > current_datetime)
    upcoming_tours = (
        db.query(models.Tour)
        .join(models.GuideTour)
        .filter(models.GuideTour.guide_id == guide_id,models.GuideTour.status == "ASSIGNED", models.Tour.date > current_datetime)
        .all()
    )
    # empty listse log gönderiyoruz
    if not upcoming_tours:
        logging.debug(f"guide with id = {guide_id} has no future tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return upcoming_tours

# TODO show PAST  (Guide-Tour) Combinations
# guides UPCOMING tours
@router.get("/past_tours/{guide_id}/", response_model=List[schemas.Tour])
def past_tours(guide_id: UUID4, db: Session = Depends(get_db)):
    #şu anki zamanı aldık
    current_datetime = datetime.now()
    
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # sadece gelecekteki turları alıyoruz  : NOTE (models.Tour.date > current_datetime)
    upcoming_tours = (
        db.query(models.Tour)
        .join(models.GuideTour)
        .filter(models.GuideTour.guide_id == guide_id,models.GuideTour.status == "ASSIGNED", models.Tour.date < current_datetime)
        .all()
    )
    # empty listse log gönderiyoruz
    if not upcoming_tours:
        logging.debug(f"guide with id = {guide_id} has no past tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return upcoming_tours



#guides all tours
@router.get("/all/{guide_id}/", response_model=List[schemas.Tour])
def show_guide_all_tours(guide_id: UUID4, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    # get the guide's all tours
    db_tour = db.query(models.Tour).join(models.GuideTour).filter(models.GuideTour.guide_id == guide_id).all()
    # empty listse log gönderiyoruz
    if not db_tour:
        logging.debug(f"guide with id = {guide_id} has no associated tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return db_tour


#TODO
@router.get("/guides_tours/{guide_id}/", response_model=List[schemas.GuideTour])
def show_all_guide_tours(guide_id: UUID4, db: Session = Depends(get_db)):
    # Check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
    
    # Get the guide's all tours
    db_guidetour = db.query(models.GuideTour).filter(models.GuideTour.guide_id == guide_id).all()
    
    # Log if no associated tours are found
    if not db_guidetour:
        logging.info(f"Guide with id = {guide_id} has no associated tours.")
    
    # Return the guide-tour assignments
    return db_guidetour


# TODO show a specific (Guide-Tour) with given id
# ON IT
@router.get("/show/{guide_id}/{tour_id}", response_model=schemas.GuideTour)
def show_one_tour(guide_id: UUID4, tour_id: int, db: Session = Depends(get_db)):
    #check if guide exists
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if not db_guide:
        raise HTTPException(
            status_code=404, detail=f"Verilen guide_id (id = {guide_id}) ile bir rehber bulunamadı."
        )  
        
    #get the tour
    db_tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not db_tour:
        raise HTTPException(
            status_code=404, detail=f"Verilen tour_id (id = {tour_id}) ile bir tur bulunamadı."
        )      
    # get the guide's all tours
    db_guidetour = db.query(models.GuideTour).filter(models.GuideTour.guide_id == guide_id,models.GuideTour.tour_id == tour_id ).first()
    # empty listse log gönderiyoruz
    if not db_guidetour:
        logging.debug(f"guide with id = {guide_id} has no associated tours.")
    # if we find the (guide-tour) then we are good to go :) return the assignments
    return db_guidetour


#get all
@router.get("/all", response_model=List[schemas.GuideTour])
def show_all_tours(db: Session = Depends(get_db)):
    db_tours = db.query(models.GuideTour).all()
    return db_tours
