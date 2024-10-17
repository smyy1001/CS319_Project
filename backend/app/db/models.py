from sqlalchemy import ( Column, String, Text, Integer, ForeignKey, Date, Float, Boolean, Table, ARRAY, Time )
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import Dict
import uuid
import datetime

Base = declarative_base()

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
    age = Column(Integer)
    name = Column(String(255))
    username = Column(String(255), unique=True)
    #password = Column(String(255))  # Should be hashed
    responsible_day = Column(String(255))  # e.g., specific weekday responsibility
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
    date = Column(Date)  # e.g., 24 August Thursday
    hour = Column(String(255))  # e.g., 13:00
    high_school_name = Column(String(255))
    city = Column(String(255))
    guide_count = Column(Integer)
    guide_1_id = Column(UUID, ForeignKey("guides.id"))
    guide_2_id = Column(UUID, ForeignKey("guides.id"))
    guide_3_id = Column(UUID, ForeignKey("guides.id"))
    confirmation = Column(String(255), default="PENDING")  # e.g., ONAY/RET
    notes = Column(String(255))


class IndividualTour(Base):
    __tablename__ = "individual_tours"
    id = Column(Integer, primary_key=True)
    date = Column(Date)  # e.g., 24 August Thursday
    daytime = Column(String(255))  # e.g., 13:00
    visitor_name = Column(String(255))
    visitor_email = Column(String(255))
    visitor_phone = Column(String(255))
    visitor_count = Column(Integer)
    assigned_guide_id = Column(UUID, ForeignKey("guides.id"))
    tour_type = Column(String(255))  # e.g., Campus Tour, Admission Tour
    notes = Column(String(255))


class School(Base):
    __tablename__ = "schools"
    id = Column(Integer, primary_key=True)
    school_name = Column(String(255))
    email = Column(String(255))
   # password = Column(String(255))  # To be hashed
    rate = Column(Integer)  # Rating scale [1-10], not visible to users
    notes = Column(String(255))


class Tour(Base):
    __tablename__ = "tours"
    id = Column(Integer, primary_key=True)
    confirmation = Column(String(255), default="PENDING")  # BTO ONAY, BTO IPTAL, ONAY, TUR IPTAL
    high_school_name = Column(String(255))
    city = Column(String(255))
    date = Column(Date)  # e.g., 24 August Thursday
    daytime = Column(String(255))  # e.g., 13:00
    student_count = Column(Integer)
    teacher_name = Column(String(255))
    teacher_phone_number = Column(String(255))
    salon = Column(String(255))  # e.g., Mithat Çoruh or empty
    form_sent_date = Column(Date, nullable=True) # we actually dont need this, but maybe beneficial for the record, idk?
    guide_id = Column(UUID, ForeignKey("guides.id"))  # How to store array of guides?
    notes = Column(String(255))


class Puantaj(Base):
    __tablename__ = "puantaj"
    id = Column(Integer, primary_key=True)
    guide_id = Column(UUID, ForeignKey("guides.id", ondelete="CASCADE"))
    date = Column(Date)  # The date of attendance or work
    time_in = Column(Time)  # Start time, e.g., 13:00
    time_out = Column(Time)  # End time, e.g., 15:30
    notes = Column(String(255))


class GuideTour(Base):
    __tablename__ = "guides_tours"
    guide_id = Column(
        UUID, ForeignKey("guides.id", ondelete="CASCADE"), primary_key=True
    )
    tour_id = Column(
        Integer, ForeignKey("tours.id", ondelete="CASCADE"), primary_key=True
    )
