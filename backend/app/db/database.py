from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base
import os
import uuid
from dotenv import load_dotenv
from .models import Tour, Advisor, Guide, GuideTour, User


load_dotenv()
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('DOCKER_POSTGRES_PORT')}/{os.getenv('POSTGRES_DATABASE')}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # Create some initial data for tours
    tours = [
        Tour(
            confirmation="BTO ONAY",
            date="2024-10-25 14:30:00",
            city="Kahramanmaraş",
            high_school_name="Maraş Anadolu Lisesi",
            teacher_name="Ahmet",
            teacher_phone_number="0531234567",
            student_count=60,
        ),
        Tour(
            confirmation="BTO ONAY",
            date="2024-10-26 11:30:00",
            city="Ankara",
            high_school_name="Ankara Anadolu Lisesi",
            teacher_name="Furkan",
            teacher_phone_number="0535675567",
            student_count=130,
        ),
        Tour(
            confirmation="ONAY",
            date="2024-10-25 09:45:00",
            city="Erzurum",
            high_school_name="Erzurum Anadolu Lisesi",
            teacher_name="Sumeyye",
            teacher_phone_number="053575467567",
            student_count=181,
        ),
        Tour(
            date="2024-10-28 16:30:00",
            city="Ankara",
            high_school_name="Ankara2 Anadolu Lisesi",
            teacher_name="Ömer",
            teacher_phone_number="35464564567",
            student_count=80,
        ),
        Tour(
            confirmation="BTO ONAY",
            date="2024-10-29 13:00:00",
            city="Kayseri",
            high_school_name="Kayseri Anadolu Lisesi",
            teacher_name="Ömer",
            teacher_phone_number="0786964567",
            student_count=59,
        ),
    ]
    db.add_all(tours)

    advisors = [
        Advisor(
            name="Ahmet",
            username="ahmet",
            email="emr@e.com",
            phone="0531234567",
            responsible_day=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        ),
        Advisor(
            name="Sumeyye",
            username="sumeyye",
            email="smy@ye.com",
            phone="0535675567",
            responsible_day=["Friday", "Saturday", "Sunday"],
        ),
    ]
    db.add_all(advisors)

    # Create and commit users before guides
    users = [
        User(id=uuid.uuid4(), username="ahmet", password="asd"),
        User(id=uuid.uuid4(), username="sumeyye", password="asd"),
        User(id=uuid.uuid4(), username="ali", password="asd"),
    ]
    db.add_all(users)
    db.commit()  # Commit users to the database first to satisfy foreign key constraints

    # Now create and add guides
    guides = [
        Guide(
            id=users[0].id,
            user_id=users[0].id,
            name="Ahmet",
            username="ahmet_guide",
            available_time="09:00-17:00",
            phone="05431234567",
            email="ali@guide.com",
            guide_rating=8,
            emergency_contact_name="Veli",
            emergency_contact_phone="05431234568",
            start_date="2024-01-01",
            end_date=None,
        ),
        Guide(
            id=users[1].id,
            user_id=users[1].id,
            name="Sumeyye",
            username="s_guide",
            available_time="10:00-18:00",
            phone="05435678901",
            email="ayse@guide.com",
            guide_rating=9,
            emergency_contact_name="Mehmet",
            emergency_contact_phone="05435678902",
            start_date="2023-05-15",
            end_date=None,
        ),
        Guide(
            id=users[2].id,
            user_id=users[2].id,
            name="Mustafa",
            username="m_guide",
            available_time="11:00-19:00",
            phone="05437890123",
            email="fatma@guide.com",
            guide_rating=7,
            emergency_contact_name="Ahmet",
            emergency_contact_phone="05437890124",
            start_date="2022-10-01",
            end_date=None,
        ),
    ]
    db.add_all(guides)
    db.commit()

    # Create and add guides_tours
    guides_tours = [
        GuideTour(guide_id=guides[0].user_id, tour_id=tours[0].id, status="ASSIGNED"),
        GuideTour(guide_id=guides[1].user_id, tour_id=tours[0].id, status="REQUESTED"),
        GuideTour(guide_id=guides[1].user_id, tour_id=tours[1].id, status="REQUESTED"),
        GuideTour(guide_id=guides[2].user_id, tour_id=tours[2].id, status="ASSIGNED"),
        GuideTour(guide_id=guides[1].user_id, tour_id=tours[3].id, status="REQUESTED"),
    ]
    db.add_all(guides_tours)

    # Commit all remaining records to the database
    db.commit()
    db.close()
