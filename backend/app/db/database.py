from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base
import os
import uuid
from uuid import uuid4
from dotenv import load_dotenv
from .models import Tour, Advisor, Guide, GuideTour, User, School, Fair, Admin


load_dotenv()
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('DOCKER_POSTGRES_PORT')}/{os.getenv('POSTGRES_DATABASE')}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    fairs = [
        Fair(
            confirmation="BTO ONAY",
            date="2024-12-25 14:30:00",
            city="Ankara",
            high_school_name="Pınar Koleji",
            email = "furkan.basibuyuk20@gmail.com",
            phone = "05329859090",
            guide_count=8,
            feedback = "Eksik bilgi"
        ),
        Fair(
            confirmation="BTO ONAY",
            date="2024-11-25 17:30:00",
            city="Ankara",
            email = "furkan.basibuyuk20@gmail.com",
            high_school_name="Çağlayan Fen Lisesi",
            phone = "05329859090",
            guide_count=5,
            feedback = "Eksik bilgi"
        ),
        Fair(
            confirmation="ONAY",
            date="2024-12-21 13:30:00",
            city="Ankara",
            email = "furkan@gmail.com",
            high_school_name="ABC Koleji",
            phone = "05329859090",
            guide_count=2,
        ),
        Fair(
            confirmation="PENDING",
            date="2024-12-21 13:30:00",
            city="Ankara",
            email = "sümeyye@gmail.com",
            high_school_name="Birey Koleji",
            phone = "05329859090",
            guide_count=1,
        ),
    ]

    db.add_all(fairs)
    # Create some initial data for tours
    tours = [
        Tour(
            confirmation="PENDING",
            date="2024-12-02 14:30:00",
            city="Konya",
            high_school_name="School One",
            teacher_name="Ahmett",
            teacher_phone_number="0531234567",
            student_count=160,
        ),
        Tour(
            confirmation="PENDING",
            date="2024-12-26 11:30:00",
            city="Ankara",
            high_school_name="School One",
            teacher_name="Furkan",
            teacher_phone_number="0535675567",
            student_count=130,
        ),
        Tour(
            confirmation="ONAY",
            date="2024-11-25 09:45:00",
            city="Erzurum",
            high_school_name="School One",
            teacher_name="Sumeyye",
            teacher_phone_number="053575467567",
            student_count=181,
        ),
        Tour(
            date="2024-12-28 16:30:00",
            city="Ankara",
            high_school_name="School One",
            teacher_name="Ömer",
            teacher_phone_number="35464564567",
            student_count=80,
        ),
        Tour(
            confirmation="PENDING",
            date="2024-12-29 13:00:00",
            city="Kayseri",
            high_school_name="School One",
            teacher_name="Ömer",
            teacher_phone_number="0786964567",
            student_count=59,
        ),
    ]
    db.add_all(tours)

    users = [
        User(id=uuid.uuid4(), username="ahmet3", password="asd"),
        User(id=uuid.uuid4(), username="furkan", password="asd"),
        User(id=uuid.uuid4(), username="sumeyyhe", password="asd"),
        User(
            id=uuid.uuid4(),
            username="ali",
            password="$2b$12$eZ7KC4x8aUWuMNxAlVQP3uJEIol5OktB5Wo1Jkp/.B75IqY/nnUg6",
        ),
        User(id=uuid.uuid4(), username="school1@example.com", password="password123"),
        User(id=uuid.uuid4(), username="school2@example.com", password="password123"),
        User(id=uuid.uuid4(), username="school3@example.com", password="password123"),
        User(
            id=uuid.uuid4(),
            username="sumeyye",
            password="$2b$12$eZ7KC4x8aUWuMNxAlVQP3uJEIol5OktB5Wo1Jkp/.B75IqY/nnUg6",
        ),
        User(id=uuid.uuid4(), username="bschool3@example.com", password="password123"),
        User(
            id=uuid.uuid4(),
            username="aasd",
            password="$2b$12$eZ7KC4x8aUWuMNxAlVQP3uJEIol5OktB5Wo1Jkp/.B75IqY/nnUg6",
        ),
    ]
    db.add_all(users)
    db.commit()  # Commit users to the database first to satisfy foreign key constraints

    advisors = [
        Advisor(
            name="Ahmet",
            user_id=users[6].id,
            username="ahmet",
            email="emr@e.com",
            phone="0531234567",
            responsible_day=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        ),
        Advisor(
            name="Sumeyye",
            user_id=users[7].id,
            username="sumeyye",
            email="smy@ye.com",
            phone="0535675567",
            responsible_day=["Friday", "Saturday", "Sunday"],
        ),
    ]
    db.add_all(advisors)
    db.commit()

    admins = [
        Admin(
            name="admin",
            user_id=users[9].id,
            id=users[9].id,
            email="emr@e.com",
            phone="0531234567",
        ),
    ]
    db.add_all(admins)
    db.commit()

    guides = [
        Guide(
            id=users[0].id,
            user_id=users[0].id,
            name="Ahmet",
            username="ahmet3",
            available_time="09:00-17:00",
            phone="05431234567",
            email="ali@guide.com",
            guide_rating=8,
            total_ratings=8,
            rating_sum=1,
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
            total_ratings=9,
            rating_sum=1,
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
            total_ratings=7,
            rating_sum=1,
            emergency_contact_name="Ahmet",
            emergency_contact_phone="05437890124",
            start_date="2022-12-01",
            end_date=None,
        ),
    ]
    db.add_all(guides)
    db.commit()

    schools = [
        School(
            user_id=users[3].id,
            school_name="School One",
            city="Ankara",
            email="school1@example.com",  # Same as username
            rate=9,
            user_name="Contact One",
            user_role="admin",
            user_phone="05431234567",
            notes="A prestigious school in Ankara.",
        ),
        School(
            user_id=users[4].id,
            school_name="School Two",
            city="Istanbul",
            email="school2@example.com",  # Same as username
            rate=8,
            user_name="Contact Two",
            user_role="admin",
            user_phone="05435678901",
            notes="Known for its strong academic programs.",
        ),
        School(
            user_id=users[5].id,
            school_name="School Three",
            city="Izmir",
            email="school3@example.com",  # Same as username
            rate=7,
            user_name="Contact Three",
            user_role="admin",
            user_phone="05437890123",
            notes="A school with excellent extracurricular activities.",
        ),
    ]
    db.add_all(schools)
    db.commit()

    # Create and add guides_tours
    # guides_tours = [
    #     GuideTour(guide_id=guides[0].user_id, tour_id=tours[0].id, status="ASSIGNED"),
    #     GuideTour(guide_id=guides[1].user_id, tour_id=tours[0].id, status="ASSIGNED"),
    #     GuideTour(guide_id=guides[1].user_id, tour_id=tours[1].id, status="REQUESTED"),
    #     GuideTour(guide_id=guides[2].user_id, tour_id=tours[0].id, status="ASSIGNED"),
    #     GuideTour(guide_id=guides[1].user_id, tour_id=tours[3].id, status="REQUESTED"),
    # ]
    # db.add_all(guides_tours)

    # Commit all remaining records to the database
    db.commit()
    db.close()
