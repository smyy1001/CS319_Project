from sqlalchemy import ( Column, DateTime, String, Text, Integer, ForeignKey, Date, Float, Boolean, Table, ARRAY, Time, func )
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import Dict
import uuid
import datetime

Base = declarative_base()
# spesifik değer alabilen stringler:
# tours.confirmation -> PENDING, BTO ONAY, ONAY, BTO RET,RET
# guides.confirmation -> NONE, ASSIGNED, REQUESTED

# TO BE WRITTEN....

# EXAMPLE
class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=False)


class Advisor(Base):
    __tablename__ = "advisors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"))  # Link to user table
    age = Column(Integer)
    name = Column(String(255))
    username = Column(String(255), unique=True)
    responsible_day = Column(ARRAY(String(255))) # 'PAZARTESİ' 'SALI' 'ÇARŞAMBA' 'PERŞEMBE' 'CUMA' 'CUMARTESİ' 'PAZAR'
    #password = Column(String(255))  # Should be hashed
    phone = Column(String(255))
    email = Column(String(255))
    profile_picture_url = Column(String(255))
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(255))
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    isactive = Column(Boolean, default=True)
    notes = Column(Text)


class Guide(Base):
    __tablename__ = "guides"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"))  # Link to user table
    name = Column(String(255))
    username = Column(String(255), unique=True)
   # password = Column(String(255))  # Should be hashed
    available_time = Column(String(255))  # Time the guide is available
    phone = Column(String(255))
    email = Column(String(255))  # Email checks should be handled elsewhere
    guide_rating = Column(Integer)  # Rating scale [1-10]
    profile_picture_url = Column(String(255))
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(255))
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    isactive = Column(Boolean, default=True)
    notes = Column(Text)


class Fair(Base):
    __tablename__ = "fairs"
    id = Column(Integer, primary_key=True)
    date = Column(DateTime)  # e.g., 24 August Thursday
    hour = Column(String(255))  # e.g., 13:00
    high_school_name = Column(String(255))
    city = Column(String(255))
    guide_count = Column(Integer)
    # guide_1_id = Column(UUID, ForeignKey("guides.id"))
    # guide_2_id = Column(UUID, ForeignKey("guides.id"))
    # guide_3_id = Column(UUID, ForeignKey("guides.id"))
    guides = Column(ARRAY(UUID))
    confirmation = Column(String(255), default="PENDING")  # e.g., ONAY/RET
    notes = Column(String(255))


class IndividualTour(Base):
    __tablename__ = "individual_tours"
    id = Column(Integer, primary_key=True)
    date = Column(DateTime)  # e.g., 24 August Thursday
    daytime = Column(String(255), nullable=True)  # e.g., 13:00
    high_school_name = Column(String(255), nullable=True)  
    visitor_name = Column(String(255), nullable=True)
    visitor_email = Column(String(255), nullable=True)
    visitor_phone = Column(String(255), nullable=True)
    visitor_count = Column(Integer)
    #assigned_guide_id = Column(UUID, ForeignKey("guides.id"))
    #tour_type = Column(String(255))  # e.g., Campus Tour, Admission Tour
    notes = Column(String(255))


class School(Base):
    __tablename__ = "schools"
    id = Column(Integer, primary_key=True)  # SERIAL PRIMARY KEY
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"),nullable =True)  # Foreign key to users table
    school_name = Column(String(255),nullable =True)  # Name of the school
    city = Column(String(255),nullable =True)  # Name of the city
    email = Column(String(255),nullable =True)  # School's email
    password = Column(String(255),nullable =True)  # To be encoded
    rate = Column(Integer,nullable =True)  # Rating scale [1-10], not visible to users
    notes = Column(Text,nullable =True)  # Additional notes
    user_name = Column(String(255),nullable =True)
    user_role = Column(String(255),nullable =True)
    user_phone = Column(String(255),nullable =True)

class Tour(Base):
    __tablename__ = "tours"
    id = Column(Integer, primary_key=True)
    confirmation = Column(String(255), default="PENDING")  # PENDING, BTO ONAY, BTO IPTAL, ONAY, TUR IPTAL
    high_school_name = Column(String(255))
    city = Column(String(255))
    date = Column(DateTime)  # e.g., 24 August Thursday
    daytime = Column(String(255))  # e.g., 13:00
    student_count = Column(Integer)
    teacher_name = Column(String(255))
    teacher_phone_number = Column(String(255))
    salon = Column(String(255))  # e.g., Mithat Çoruh or empty
    form_sent_date = Column(DateTime, server_default=func.now())
    guide_id = Column(UUID, ForeignKey("guides.id"))  # How to store array of guides?
    notes = Column(String(255))


class Puantaj(Base):
    __tablename__ = "puantaj"
    id = Column(Integer, primary_key=True)
    guide_id = Column(UUID, ForeignKey("guides.id", ondelete="CASCADE"))
    date = Column(DateTime)  # The date of attendance or work
    time_in = Column(Time)  # Start time, e.g., 13:00
    time_out = Column(Time)  # End time, e.g., 15:30
    notes = Column(String(255))

# GuideFair model NOTE status = 'ASSIGNED' or 'REQUESTED'
class GuideFair(Base):
    __tablename__ = "guides_fairs"
    guide_id = Column(
        UUID, ForeignKey("guides.id", ondelete="CASCADE"), primary_key=True
    )
    fair_id = Column(
        Integer, ForeignKey("fairs.id", ondelete="CASCADE"), primary_key=True
    )
    status = Column(String(50), nullable=False)  # 'REQUESTED' or 'ASSIGNED'
    
# GuideTour  model NOTE status = 'ASSIGNED' or 'REQUESTED'
class GuideTour(Base):
    __tablename__ = "guides_tours"
    guide_id = Column(
        UUID, ForeignKey("guides.id", ondelete="CASCADE"), primary_key=True
    )
    tour_id = Column(
        Integer, ForeignKey("tours.id", ondelete="CASCADE"), primary_key=True
    )
    status = Column(String(50), nullable=False)  # ASSIGNED, REQUESTED

#added
class Admin(Base):
    __tablename__ = "admins"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # UUID primary key
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"))  # Links admin to a user
    name = Column(String(255), nullable=False)  # Admin's name
    email = Column(String(255), unique=True, nullable=False)  # Admin's email
    phone = Column(String(255))  # Admin's phone number
    role = Column(String(50), default="Admin")  # Admin role, defaults to 'Admin'
    start_date = Column(Date)  # Start date for admin role
    end_date = Column(Date)  # End date if role has ended
    is_active = Column(Boolean, default=True)  # Active status
    notes = Column(Text)  # Additional notes


#added
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)  # Use SERIAL equivalent in SQLAlchemy
    guide_id = Column(UUID, ForeignKey("guides.id", ondelete="CASCADE"))  # Foreign key to guides table
    message = Column(Text, nullable=False)  # Notification message
    seen = Column(Boolean, default=False)  # Status of the notification (seen/unseen)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)  # When the notification was created
