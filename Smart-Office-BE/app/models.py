from pydantic import BaseModel, Field, ConfigDict
from .enums import Home

class BaseRecord(BaseModel):
    id: str = Field(..., alias="_id")
    created_at: str = Field(...)
    model_config = ConfigDict(
        populate_by_name=True
    )
    
class FloatRecord(BaseRecord):
    value: float = Field(...)
    
class IntRecord(BaseRecord):
    value: int = Field(...)