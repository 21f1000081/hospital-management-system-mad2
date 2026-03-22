from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    passhash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient')

    is_active = db.Column(db.Boolean, default=True)

    patient = db.relationship('Patient', backref='user', lazy=True, uselist=False, cascade='all, delete-orphan')
    doctor = db.relationship('Doctor', backref='user', lazy=True, uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        self.passhash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.passhash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active
        }

class Department(db.Model):
    __tablename__ = 'department'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)

    doctor = db.relationship('Doctor', backref='department', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

class Doctor(db.Model):
    __tablename__ = 'doctor'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    qualification = db.Column(db.String(120), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    specialization = db.Column(db.String(120), nullable=False)
    experience_years = db.Column(db.Integer)
    phone = db.Column(db.String(20))
    blacklisted = db.Column(db.Boolean, default=False, nullable=False)

    appointments = db.relationship('Appointment', backref='doctor', lazy=True, cascade='all, delete-orphan')
    availability = db.relationship('Availability', backref='doctor', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "qualification": self.qualification,
            "specialization": self.specialization,
            "experience_years": self.experience_years,
            "phone": self.phone,
            "blacklisted": self.blacklisted,
            "department_id": self.department_id,
            "department": self.department.name if self.department else None
        }

class Availability(db.Model):
    __tablename__ = 'availability'
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    morning_slot_status = db.Column(db.String(20), default='not available', nullable=False)
    evening_slot_status = db.Column(db.String(20), default='not available', nullable=False)

    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'date', name='uq_doctor_availability_date'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "date": self.date.isoformat(),
            "morning_slot_status": self.morning_slot_status,
            "evening_slot_status": self.evening_slot_status
        }


class Patient(db.Model):
    __tablename__ = 'patient'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    dob = db.Column(db.Date)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    blacklisted = db.Column(db.Boolean, nullable=False, default=False)

    appointments = db.relationship('Appointment', backref='patient', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "dob": self.dob.isoformat() if self.dob else None,
            "phone": self.phone,
            "address": self.address,
            "blacklisted": self.blacklisted
        }


class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    treatment = db.relationship('Treatment', backref='appointment', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "patient": self.patient.name if self.patient else None,
            "doctor": self.doctor.name if self.doctor else None,
            "date": self.date.isoformat(),
            "time": self.time,
            "type": self.type,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        __table_args__ = (
            db.UniqueConstraint('doctor_id', 'date', 'time', name='uq_doctor_date_time'),
        )


class Treatment(db.Model):
    __tablename__ = 'treatment'
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id', ondelete='CASCADE'), nullable=False, unique=True)
    tests = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    medicine = db.relationship('Medicine', backref='treatment', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "tests": self.tests,
            "diagnosis": self.diagnosis,
            "prescription": self.prescription,
            "medicines": [m.to_dict() for m in self.medicine],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Medicine(db.Model):
    __tablename__ = 'medicine'
    id = db.Column(db.Integer, primary_key=True)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatment.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dosage_morning = db.Column(db.String(20), default='0')
    dosage_day = db.Column(db.String(20), default='0')
    dosage_night = db.Column(db.String(20), default='0')

    def to_dict(self):
        return {
            "id": self.id,
            "treatment_id": self.treatment_id,
            "name": self.name,
            "dosage_morning": self.dosage_morning,
            "dosage_day": self.dosage_day,
            "dosage_night": self.dosage_night
        }
