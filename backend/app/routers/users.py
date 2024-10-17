from fastapi import FastAPI, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
import app.db.models as models
from app.deps import get_db
from app.utils import hash_password,verify_password
import app.schemas as schemas
from pydantic import UUID4
from typing import List


router = APIRouter()

# from the frontend the methods will be reached like: /api/{tableName}/{method}
# for example: /api/users/add, /api/users/delete/{user_id}, /api/users/all

@router.post("/add/", response_model=schemas.User)
def create_sistem(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # check if the name is unique
    db_user = (
        db.query(models.User).filter(models.User.username == user.username).first()
    )
    if db_user:
        raise HTTPException(
            status_code=400, detail="Bu email ile bir kullanıcı zaten var."
        )

    # Hash the password before saving
    hashed_password = hash_password(user.password)

    db_user = models.User(**user.dict(exclude={"password"}), password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# possible improvements : password validation only checks if password kength >=8, we can add more of this.
@router.post("/change_password/{user_id}", response_model=schemas.User)
def change_password(user_id: UUID4, old_password: str, new_password: str, db: Session = Depends(get_db)):
    
    #get the user with specified id
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # if the user not found, throw error
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    #if the entered password is wrong.
    if not db_user.password == old_password: 
        raise HTTPException(status_code=400, detail="Girilen şifre yanlış")
    
    #if the new password is of length < 8
    # if len(new_password) < 8:
    #     raise HTTPException(status_code=400, detail="Şifre 8 karakterden uzun olmalı") 
    
    # now it's time to change the password :)
    hashed_password = hash_password(new_password)
    db_user.password = hashed_password
    
    #catching other possible exceptions
    try:
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Şifre değiştirme işlemi başarısız oldu")
    return db_user


@router.delete("/delete/{user_id}", response_model=schemas.User)
def delete_sistem(user_id: UUID4, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    db.delete(db_user)
    db.commit()
    return db_user


@router.delete("/delete/username/{username}", response_model=schemas.User)
def delete_with_username(username: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    db.delete(db_user)
    db.commit()
    return db_user


# from the frontend the get methods will be reached like: localhost:8000/api/{tableName}/{method}
# for example: localhost:8000/api/users/all
@router.get("/all/", response_model=List[schemas.User])
def get_all_sistems(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users
