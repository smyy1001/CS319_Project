from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
import app.schemas as schemas
from app.utils import hash_password
from pydantic import UUID4
from typing import List


router = APIRouter()


#assign guides to specific tours
@router.post("/assign_guide/{guide_id}/{tour_id}", response_model=schemas.GuideTour)
def assign_guides(guide_id: UUID4, tour_id: UUID4, db: Session = Depends(get_db)):
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
    if db_guidetour:
        raise HTTPException(
            status_code=409, detail="Bu rehbere bu tur zaten verilmiş." # 409 = conflict
        )
    #if eveything works correctly, now we can assign the guide to the tour (add these values to the GuideTour)
    new_assign = models.GuideTour(guide_id = guide_id,tour_id =tour_id) 

    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)
    return new_assign



