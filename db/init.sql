CREATE DATABASE db
  WITH ENCODING 'UTF8'
  LC_COLLATE='tr_TR.UTF-8'
  LC_CTYPE='tr_TR.UTF-8'
  TEMPLATE=template0;

GRANT ALL PRIVILEGES ON DATABASE db TO admin;

\c db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );

        -- All passwords are 123456!!!
        -- INSERT INTO users (username, password) VALUES ('SUMEYYE', '$2b$12$aVbKUX/WxpmVwdzBKSR2B.ZmoRuJuOWDSDNYaOGeDwIx0cgKNm9WG');
        -- INSERT INTO users (username, password) VALUES ('ÖMER1', '$2b$12$aVbKUX/WxpmVwdzBKSR2B.ZmoRuJuOWDSDNYaOGeDwIx0cgKNm9WG');
        -- INSERT INTO users (username, password) VALUES ('ÖMER2', '$2b$12$aVbKUX/WxpmVwdzBKSR2B.ZmoRuJuOWDSDNYaOGeDwIx0cgKNm9WG');
        -- INSERT INTO users (username, password) VALUES ('FURKAN', '$2b$12$aVbKUX/WxpmVwdzBKSR2B.ZmoRuJuOWDSDNYaOGeDwIx0cgKNm9WG');
    END IF;


    -- tables added -OEA

    -- MY CONCERNS
    -- 15.10.24 - OEA
    -- I have added junction tables for Guide - Puantaj (One to Many), for Tour - Guide (Many to Many) 
    -- should we do the same for fairs?

    -- TOURS table
    -- should adviser directly store the guides from whom they are responsible for, or is the specific_day enough? 
    -- BTO ONAY, ONAY RET gibi sınırlı değer alabilen değişkenlere varchar yerine enum mı desek?
    -- guide lar için "available_time VARCHAR(255)"


    -- ADVISORS table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'advisors'
    ) THEN
        CREATE TABLE  advisors (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            age INTEGER,
            name VARCHAR(255),
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255), -- to be hashed
            responsible_day VARCHAR(255), -- specific day responsibility, each adviser is responsible for a specific weekday (e.g. Perşembe)
            phone VARCHAR(255),
            email VARCHAR(255),
            profile_picture_url VARCHAR(255),
            emergency_contact_name VARCHAR(255),
            emergency_contact_phone VARCHAR(255),
            start_date DATE,
            end_date DATE,
            isactive BOOLEAN DEFAULT TRUE,
            notes TEXT
        );
    END IF;

    -- GUIDES table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'guides'
    ) THEN
        CREATE TABLE guides (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255),
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            available_time VARCHAR(255), -- bunu böyle mi yapmak lazım? 
            phone VARCHAR(255),
            email VARCHAR(255), -- EMAIL CHECKS SHOULD BE HANDLED
            guide_rating INTEGER, -- rate € [1,10]
            profile_picture_url VARCHAR(255),
            emergency_contact_name VARCHAR(255),
            emergency_contact_phone VARCHAR(255),
            start_date DATE,
            end_date DATE,
            isactive BOOLEAN,
            --puantaj VARCHAR(255), -- deleted since now we have a junction table, otherwise we'd store arrays of long strings for each tour etc. Idk it just doesnt feel right sdkfdsf tell me if we shouldnt do this way -OEA
            notes TEXT
        );
    END IF;

    -- FAIRS table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'fairs'
    ) THEN
        CREATE TABLE fairs (
            id SERIAL PRIMARY KEY,
            date Date, -- e.g., 24 August Thursday
            hour VARCHAR(255), -- e.g. 13.00
            high_school_name VARCHAR(255),
            city VARCHAR(255),
            guide_count INTEGER,
            guide_1_id UUID REFERENCES guides(id),
            guide_2_id UUID REFERENCES guides(id),
            guide_3_id UUID REFERENCES guides(id),
            confirmation VARCHAR(255) DEFAULT 'PENDING', -- fair larda direk ONAY RET var sadece
            notes VARCHAR(255)
        );
    END IF;

    -- INDIVIDUAL TOURS table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'individual_tours'
    ) THEN
        CREATE TABLE individual_tours (
            id SERIAL PRIMARY KEY,
            date Date, -- e.g., 24 August Thursday
            daytime VARCHAR(255), -- (e.g. 13.00)
            visitor_name VARCHAR(255),
            visitor_email VARCHAR(255),
            visitor_phone VARCHAR(255),
            visitor_count INTEGER, -- should it be 1 student? should we keep this?
            assigned_guide_id UUID REFERENCES guides(id),
            tour_type VARCHAR(255), -- e.g., Campus Tour, Admission Tour
            notes VARCHAR(255)
        );
    END IF;

    -- SCHOOLS table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'schools'
    ) THEN
        CREATE TABLE schools (
            id SERIAL PRIMARY KEY,
            school_name VARCHAR(255),
            email VARCHAR(255),
            password VARCHAR(255), -- to be encoded
            rate INTEGER, -- rate € [1,10], ranking not visible to users, 
            notes VARCHAR(255)
        );
    END IF;


    -- TOURS table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'tours'
    ) THEN
        CREATE TABLE tours (
            id SERIAL PRIMARY KEY,
            confirmation VARCHAR(255) DEFAULT 'PENDING', -- PENDING, BTO ONAY (Adviser), BTO IPTAL (Adviser), ONAY (Dilek hoca onay), TUR IPTAL (Dilek hoca ret)
            high_school_name VARCHAR(255),
            city VARCHAR(255),
            date Date, -- e.g., 24 August Thursday
            daytime VARCHAR(255), -- e.g., 13.00
            student_count INTEGER, -- note, additional guides for > 60
            teacher_name VARCHAR(255),
            teacher_phone_number VARCHAR(255),
            salon VARCHAR(255), -- e.g., Mithat Çoruh or empty
            form_sent_date Date, -- tour date should be at least 2 weeks after the form sent date.
            guide_id UUID REFERENCES guides(id),
            notes VARCHAR(255)
        );
    END IF;
    
    -- PUANTAJ table (One-to-Many with guides)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'puantaj'
    ) THEN
        CREATE TABLE puantaj (
            id SERIAL PRIMARY KEY,
            guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
            date DATE, -- the date of attendance or work 
            time_in TIME, -- when the guide started e.g. 13.00
            time_out TIME, -- when the guide ended e.g. 15.30 guide will write this
            notes VARCHAR(255) -- any additional notes
        );
    END IF;

    -- GUIDES_TOURS junction table (Many-to-Many)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'guides_tours'
    ) THEN
        CREATE TABLE guides_tours (
            guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
            tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
            PRIMARY KEY (guide_id, tour_id)
        );
    END IF;

END $$;