from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from datetime import date, datetime
from decimal import Decimal

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    weekly_contribution: Optional[Decimal] = Field(default=None, description="Weekly contribution amount", ge=0)
    role: Literal['admin','member'] = 'member'

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    weekly_contribution: Optional[Decimal] = Field(default=None, ge=0)

class UserOut(BaseModel):
    id: str
    email: EmailStr | None = None
    full_name: str | None = None
    role: str
    weekly_contribution: Optional[Decimal] = None
    total_contributed: Optional[Decimal] = None
    borrowing_limit: Optional[Decimal] = None
    current_loan_balance: Optional[Decimal] = None

class ContributionCreate(BaseModel):
    user_id: str
    amount: Decimal = Field(..., ge=0)
    period_year: int
    period_week: int
    due_date: date

class ContributionMarkPaid(BaseModel):
    amount: Decimal = Field(..., ge=0)
    method: str | None = None

class ContributionUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, ge=0)
    due_date: date | None = None

class ContributionOut(BaseModel):
    id: str
    user_id: str
    amount: Decimal
    status: str
    period_year: int
    period_week: int
    due_date: date
    paid_at: datetime | None = None
    method: str | None = None

class StatsMeOut(BaseModel):
    weekly_contribution: Optional[Decimal]
    weeks_active: int
    expected_total: Decimal
    actual_total: Decimal
    deficiency: Decimal
    current_loan_balance: Optional[Decimal]
    borrowing_limit: Optional[Decimal]

class LoanRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)
    duration_weeks: int = Field(..., gt=0)
    reason: str | None = None

class LoanActionResponse(BaseModel):
    id: str
    status: str
    amount: Decimal
    remaining_balance: Decimal | None = None
    weekly_payment: Decimal | None = None

class LoanPayment(BaseModel):
    amount: Decimal = Field(..., gt=0)
