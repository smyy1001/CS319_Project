from pydantic import BaseModel, UUID4, Field
from typing import List, Optional, Dict
from datetime import date, datetime, time

# Optionals are added in dates. Otherwise Put/Patch requests require date entry, 2 routes would have to be called in that case.
# notes body
class NotesUpdate(BaseModel):
    notes: Optional[str] = None

# Example
class UserBase(BaseModel):
    username: Optional[str] = None  #email
    password: Optional[str] = None 


class UserCreate(UserBase):
    id: Optional[UUID4] = None


class User(UserBase):
    id: Optional[UUID4] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str # role can be 'school' , 'guide' , 'admin' , 'advisor'

# guide fair added
class GuideFairBase(BaseModel):
    guide_id: UUID4  # Assuming guide_id is of type UUID
    fair_id: int
    status: Optional[str]  # Can be 'REQUESTED' or 'ASSIGNED'

class GuideFairCreate(GuideFairBase):
    pass

class GuideFair(GuideFairBase):
    class Config:
        from_attributes = True    

# guide tour
class GuideTourBase(BaseModel):
    guide_id: UUID4
    tour_id: int
    status: Optional[str]  # Can be 'REQUESTED' or 'ASSIGNED'

class GuideTourCreate(GuideTourBase):
    pass

class GuideTour(GuideTourBase):
    class Config:
        from_attributes = True


class PuantajBase(BaseModel):
    guide_id: Optional[UUID4] = None
    date: Optional[datetime] = None # can be of 'date' type
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
    confirmation: Optional[str] = None
    high_school_name: Optional[str] = None
    city: Optional[str] = None
    date: Optional[datetime] = None
    # daytime: Optional[str] = None
    student_count: Optional[int] = None
    teacher_name: Optional[str] = None
    teacher_phone_number: Optional[str] = None
    salon: Optional[str] = None
    form_sent_date: Optional[datetime] = None # might be problematic
    guide_id: Optional[UUID4] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None


class TourCreate(TourBase):
    pass


class Tour(TourBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class SchoolBase(BaseModel):
    school_name: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    rate: Optional[int] = None  # Ranking [1, 10]
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    user_phone: Optional[str] = None
    notes: Optional[str] = None
    user_id: Optional[UUID4] = None  # Foreign key reference to User table


class SchoolCreate(SchoolBase):
    password: Optional[str] = None  # Unhashed password for creation


class School(SchoolBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class IndividualTourBase(BaseModel):
    date: Optional[datetime] = None
    daytime: Optional[str] = None
    high_school_name: Optional[str] = None
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    visitor_phone: Optional[str] = None
    visitor_count: Optional[int] = None
    notes: Optional[str] = None


class IndividualTourCreate(IndividualTourBase):
    pass


class IndividualTour(IndividualTourBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class FairBase(BaseModel):
    date: datetime
    hour: Optional[str] = None
    high_school_name: Optional[str] = None
    city: Optional[str] = None
    guide_count: Optional[int] = None
    guides: Optional[List[UUID4]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    feedback: Optional[str] = None
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
    # age: Optional[int] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    profile_picture_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    isactive: Optional[bool] = True
    responsible_day: Optional[List[str]] = None  # Store as a list of strings
    notes: Optional[str] = None
    user_id: Optional[UUID4] = None  # Foreign key reference to User table

    # password: str


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
    total_ratings: Optional[int] = None
    rating_sum: Optional[int] = None
    profile_picture_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    isactive: Optional[bool] = None
    notes: Optional[str] = None
    user_id: Optional[UUID4] = None  # Foreign key reference to User table

    # password: str


class GuideCreate(GuideBase):
    pass

class Guide(GuideBase):
    id: Optional[UUID4] = None

    class Config:
        from_attributes = True


# added admin
class AdminBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str]= None
    phone: Optional[str]= None
    role: Optional[str] = 'Coordinator'
    start_date: Optional[date]= None
    end_date: Optional[date]= None
    is_active: Optional[bool] = True
    notes: Optional[str]= None
    user_id: Optional[UUID4] = None  # Foreign key reference to User table


class AdminCreate(AdminBase):
    pass

class Admin(AdminBase):
    id: UUID4
    

    class Config:
        from_attributes = True


# add notifications

class NotificationBase(BaseModel):
    guide_id: UUID4
    message: Optional[str]= None
    seen: Optional[bool] = False
    created_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int

    class Config:
        from_attributes = True      


class AdvisorCreate(BaseModel):
    days: List[str]
