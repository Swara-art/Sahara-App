from pydantic import BaseModel, Field
from typing import Optional


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10)
    pincode: str = Field(..., min_length=6, max_length=6)
    location: Optional[str] = None  # optional for now


class ComplaintResponse(BaseModel):
    title: str
    description: str
    pincode: str
    location: Optional[str]
    status: str