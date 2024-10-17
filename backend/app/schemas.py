from pydantic import BaseModel, UUID4, Field
from typing import List, Optional, Dict
from datetime import date, time


# Example
class UserBase(BaseModel):
    username: str  #email
    password: str 


class UserCreate(UserBase):
    id: Optional[UUID4] = None


class User(UserBase):
    id: Optional[UUID4] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class GuideTourBase(BaseModel):
    guide_id: Optional[UUID4] = None
    tour_id: Optional[int] = None


class GuideTourCreate(GuideTourBase):
    pass


class GuideTour(GuideTourBase):
    pass


class PuantajBase(BaseModel):
    guide_id: Optional[UUID4] = None
    date: date # can be of 'date' type
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    notes: Optional[str] = None


class PuantajCreate(PuantajBase):
    pass


class Puantaj(PuantajBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class TourBase(BaseModel):
    confirmation: Optional[str] = "PENDING"
    high_school_name: Optional[str] = None
    city: Optional[str] = None
    date: date
    daytime: Optional[str] = None
    student_count: Optional[int] = None
    teacher_name: Optional[str] = None
    teacher_phone_number: Optional[str] = None
    salon: Optional[str] = None
    form_sent_date: Optional[str] = None
    guide_id: Optional[UUID4] = None
    notes: Optional[str] = None


class TourCreate(TourBase):
    pass


class Tour(TourBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class SchoolBase(BaseModel):
    school_name: Optional[str] = None
    email: Optional[str] = None
    rate: Optional[int] = None
    notes: Optional[str] = None


class SchoolCreate(SchoolBase):
    password: Optional[str] = None  # Unhashed password for creation


class School(SchoolBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class IndividualTourBase(BaseModel):
    date: date
    daytime: Optional[str] = None
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    visitor_phone: Optional[str] = None
    visitor_count: Optional[int] = None
    assigned_guide_id: Optional[UUID4] = None
    tour_type: Optional[str] = None
    notes: Optional[str] = None


class IndividualTourCreate(IndividualTourBase):
    pass


class IndividualTour(IndividualTourBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class FairBase(BaseModel):
    date: date
    hour: Optional[str] = None
    high_school_name: Optional[str] = None
    city: Optional[str] = None
    guide_count: Optional[int] = None
    guide_1_id: Optional[UUID4] = None
    guide_2_id: Optional[UUID4] = None
    guide_3_id: Optional[UUID4] = None
    confirmation: Optional[str] = "PENDING"
    notes: Optional[str] = None


class FairCreate(FairBase):
    pass


class Fair(FairBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class AdvisorBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    username: str
    phone: Optional[str] = None
    email: Optional[str] = None
    responsible_day: Optional[str] = None
    profile_picture_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    isactive: Optional[bool] = None
    notes: Optional[str] = None
    # password: str


class AdvisorCreate(AdvisorBase):
    pass


class Advisor(AdvisorBase):
    id: Optional[UUID4] = None

    class Config:
        from_attributes = True


class GuideBase(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    available_time: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    guide_rating: Optional[int] = None
    profile_picture_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    isactive: Optional[bool] = None
    notes: Optional[str] = None
    # password: str


class GuideCreate(GuideBase):
    pass


class Guide(GuideBase):
    id: Optional[UUID4] = None

    class Config:
        from_attributes = True
