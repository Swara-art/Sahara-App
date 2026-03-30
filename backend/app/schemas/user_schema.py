from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    name: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    pincode: str = Field(..., min_length=6, max_length=6)
    role: str = "citizen"  # default


class UserLogin(BaseModel):
    email: EmailStr
    password: str