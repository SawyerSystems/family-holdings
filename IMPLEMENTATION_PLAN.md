# Family Holdings – Full Implementation Plan

> Purpose: Practical, sequential roadmap to take the current codebase from prototype state to a fully functional web + mobile (Capacitor) family finance app meeting the defined requirements.

## 0. High-Level Goals
1. Admin can create/manage member accounts.
2. Members authenticate and access personal + family data.
3. Members see: required weekly amount, deficiency, personal totals, family totals, loan status.
4. Family interactions: weekly contributions, loan requests + approvals, payments.
5. Mobile build + dev experience (Capacitor) with consistent API access.
6. Security: no service role key leakage, proper auth + role checks.

## 1. Architecture Overview
- Frontend: React (Vite), Tailwind, componentized pages hitting REST API.
- Backend: FastAPI service acting as an abstraction layer over Supabase (Postgres + Auth). Service role key ONLY on backend.
- Database: Supabase (auth + tables with RLS once real auth integrated).
- Mobile: Capacitor- shell using the built web UI & native wrappers.
- Auth Phasing:
  - Phase 1: Mock user injection (dev)
  - Phase 2: Real Supabase auth (frontend) + JWT verification (backend) + RLS

## 2. Implementation Phases
| Phase | Focus | Deliverables |
|-------|-------|--------------|
| 0 | Prep & Schema | Migrations, env hygiene, baseline scripts |
| 1 | Users & Contributions Core | CRUD endpoints, summaries (me) |
| 2 | Loans & Aggregations | Loan lifecycle, family stats, deficiency calc |
| 3 | Real Auth Integration | Supabase auth flows, JWT verify, RLS |
| 4 | Mobile Dev & Packaging | `dev:mobile`, LAN config, sync + open platform |
| 5 | Testing & Hardening | Backend tests, MSW, CI updates |
| 6 | Enhancements | Scheduling, notifications, polishing |

## 3. Database Schema (Initial Migration)
File: `supabase/migrations/001_initial_schema.sql`

```sql
-- Enums
CREATE TYPE contribution_status AS ENUM ('pending','completed','late','missed');
CREATE TYPE loan_status AS ENUM ('pending','approved','rejected','paid');
CREATE TYPE user_role AS ENUM ('admin','member');

-- Profiles (Extension of auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role NOT NULL DEFAULT 'member',
  weekly_contribution numeric(10,2) DEFAULT 0,
  total_contributed numeric(12,2) DEFAULT 0,
  borrowing_limit numeric(12,2) DEFAULT 0,
  current_loan_balance numeric(12,2) DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Contributions
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_week int NOT NULL,
  amount numeric(10,2) NOT NULL,
  status contribution_status NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_year, period_week)
);
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_contributions_period ON contributions(period_year, period_week);
CREATE INDEX idx_contributions_status ON contributions(status);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status loan_status NOT NULL DEFAULT 'pending',
  reason text,
  duration_weeks int NOT NULL,
  weekly_payment numeric(10,2) NOT NULL,
  remaining_balance numeric(12,2) NOT NULL,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Loan Payments
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id);

-- Triggers (simplified examples)
CREATE OR REPLACE FUNCTION trg_update_profile_totals() RETURNS trigger AS $$
BEGIN
  UPDATE profiles p SET total_contributed = (
    SELECT COALESCE(SUM(amount),0) FROM contributions c
    WHERE c.user_id = p.id AND c.status = 'completed'
  ) WHERE p.id = NEW.user_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER after_contribution_complete
AFTER UPDATE OF status ON contributions
FOR EACH ROW WHEN (NEW.status = 'completed')
EXECUTE FUNCTION trg_update_profile_totals();

-- (Optionally add trigger for remaining_balance updates after loan payment)
```

Later (Phase 3) add RLS policies.

## 4. Backend Layers
Structure (proposed additions under `backend/`):
```
backend/
  main.py                # FastAPI app & route includes
  dependencies.py        # auth/user injection
  models.py              # Pydantic schemas
  services/              # business logic (users.py, contributions.py, loans.py, stats.py)
  routers/               # APIRouters (users.py, contributions.py, loans.py, stats.py)
  supabase_client.py     # existing (secure key handling fix)
  utils/time.py          # ISO week helpers
  tests/                 # pytest suites
```

### Core Dependencies
- `get_current_user()` (Phase 1 mock, Phase 3 JWT verify)
- `require_admin()` wrapper

### Pydantic (examples)
```python
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    weekly_contribution: condecimal(max_digits=10, decimal_places=2) | None = None
    role: Literal['admin','member'] = 'member'

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None
    role: str
    weekly_contribution: Decimal | None
    total_contributed: Decimal
    borrowing_limit: Decimal
    current_loan_balance: Decimal

class ContributionOut(BaseModel):
    id: UUID
    period_year: int
    period_week: int
    amount: Decimal
    status: str
    due_date: date
    paid_at: datetime | None

class LoanOut(BaseModel): ...
```

## 5. REST API Contract
(Frontend already expects these paths.)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /health | GET | public | Health check |
| /users/me | GET | member | Current profile + stats baseline |
| /users/me | PATCH | member | Update own profile (weekly_contribution, name) |
| /users | GET | admin | List users |
| /users | POST | admin | Create user (and Supabase auth user) |
| /users/{id} | GET | self/admin | Get specific user |
| /users/{id} | PATCH | admin | Update profile |
| /contributions/mine | GET | member | List own contributions |
| /contributions | GET | admin | List all contributions (filters) |
| /contributions | POST | admin | Create manual or future scheduled |
| /contributions/{id} | GET | member/admin | Get contribution |
| /contributions/{id} | PATCH | admin | Adjust amount/status |
| /contributions/{id}/mark-paid | POST | self/admin | Mark paid with {amount, method} |
| /loans/mine | GET | member | List own loans |
| /loans | GET | admin | All loans |
| /loans/request | POST | member | Submit loan request |
| /loans/{id}/approve | POST | admin | Approve loan |
| /loans/{id}/reject | POST | admin | Reject loan (reason) |
| /loans/{id}/payment | POST | member | Record payment |
| /stats/me | GET | member | Personal summary (expected, contributed, deficiency, loan balance) |
| /stats/family | GET | admin | Aggregated family stats |

### Sample Response: /stats/me
```json
{
  "weekly_contribution": 50,
  "weeks_active": 12,
  "expected_total": 600,
  "actual_total": 550,
  "deficiency": 50,
  "current_loan_balance": 120,
  "borrowing_limit": 500
}
```

## 6. Calculation Logic
- ISO week: `isocalendar()` for (year, week).
- Weeks active: floor((today - joined_at)/7). Minimum 1 if within first week.
- Expected = weeks_active * weekly_contribution.
- Deficiency = max(expected - actual_total, 0).
- Loan weekly_payment = amount / duration_weeks (round to 2 decimals) at creation.
- Remaining balance = amount - SUM(payments).
- Auto mark loan paid when remaining_balance <= 0.

## 7. Step-by-Step Execution
### Phase 0: Prep & Schema
1. Populate migration SQL (above) → apply via `supabase db push` or reset.
2. Create `.env.example` (NO service role key) & update `.env` locally.
3. Remove hardcoded fallback in `supabase_client.py`; error if missing.
4. Add `VITE_API_URL` entry to `.env` for frontend.
5. Add script: `"dev:mobile": "concurrently \"npm run backend:dev\" \"vite --host 0.0.0.0 --port 5273\""`.

### Phase 1: Users & Contributions Core
1. Add `models.py` (Pydantic schemas) + `dependencies.py` (mock current user injection with admin default during dev).
2. Implement `routers/users.py` (CRUD w/ supabase queries):
   - POST: create auth user (Phase 1 stub) + insert profile.
3. Implement `routers/contributions.py` minimal:
   - GET mine, GET all, POST create, mark-paid logic (validate status + update status/paid_at + trigger recalculation if necessary).
4. Add `/stats/me` endpoint computing metrics on the fly.
5. Wire routers in `main.py` under `/api` prefix (optionally) or keep root contract.
6. Frontend: Replace mock calls where expecting `User.me()` & `Contribution.getMine()` — ensure `apiClient` base URL works.
7. Manual QA: create user(s), create contributions, mark paid.

### Phase 2: Loans & Aggregations
1. Create `routers/loans.py` with request/approve/reject/payment endpoints.
2. Implement loan payment logic (transaction: insert payment then recompute remaining_balance, update status if zero).
3. Add `/stats/family` aggregation query (totals, outstanding loans, deficiency distribution).
4. Frontend: Hook loans page to real endpoints (replace placeholder mapping of fields). Adjust `LoanCard` to match API fields.
5. Add indexes if query plans show slow scans (observability later).

### Phase 3: Real Auth Integration
1. Frontend: Replace mock AuthContext with Supabase JS `createClient(anon key)`.
2. Sign-up (admin only flow): admin creates member through backend → backend uses service role to create auth user via Supabase Admin API (store email + send invite/password reset link if desired).
3. Sign-in: user logs in via Supabase; on session available, fetch `/users/me` for profile augmentation.
4. Backend: Add JWT verification dependency:
   - Fetch JWKS from Supabase once (cache) OR use supabase-py if available for verification.
   - Extract user_id from token; fetch profile; reject if missing.
5. Introduce RLS policies in a new migration:
   - `USING (auth.uid() = id)` for profiles self-select; admin override via role column using a SECURITY DEFINER function or a replicated role claim.
   - Similar per-table policies for contributions, loans.
6. Remove mock dependency path.
7. Update CORS origins to include mobile dev URL if needed.

### Phase 4: Mobile Dev & Packaging
1. Update `capacitor.config.json` server section for live reload:
   ```json
   {
     "server": { "url": "http://<LAN-IP>:5273", "cleartext": true }
   }
   ```
2. Document LAN IP discovery (`ip addr` or `ifconfig`).
3. Run `npm run build && npx cap sync`.
4. Android: `npm run mobile:android`; iOS: `npm run mobile:ios` (Mac only).
5. Add conditional base URL logic: if running in Capacitor (window.Capacitor) and no `VITE_API_URL`, derive from config or fallback.

### Phase 5: Testing & Hardening
1. Backend tests (`backend/tests/`):
   - Use `httpx.AsyncClient` with FastAPI TestClient.
   - Mock Supabase via dependency injection wrapper or a local test schema.
2. Coverage thresholds (80%+ core services).
3. Frontend:
   - msw handlers mirroring backend endpoints.
   - Tests for dashboard deficiency calculation, contribution filters, loan request form validation.
4. CI pipeline: add `backend` test stage (python -m pytest) before build.
5. Add lint (flake8 / mypy) gating script integrated into existing `ci` script.

### Phase 6: Enhancements
1. Scheduler (cron or Supabase Edge Function) to mark late/missed (due_date < today & status pending -> late; grace policy -> missed).
2. Notifications: push via Capacitor Push Notifications or email via Supabase functions.
3. Activity feed endpoint (/activity) combining contributions + loans.
4. Caching layer for expensive aggregates (Redis or materialized views) if needed.

## 8. Security Checklist
- [ ] Remove hardcoded service role key.
- [ ] Ensure `.env` excluded by `.gitignore`.
- [ ] Verify only service runtime has service key.
- [ ] Validate all numeric inputs (reject <= 0 amounts).
- [ ] Enforce ownership in each mutation.
- [ ] Add rate limiting (optional: simple in-memory for now).

## 9. Scripts to Add / Modify (package.json)
```json
{
  "scripts": {
    "dev:mobile": "concurrently \"npm run backend:dev\" \"vite --host 0.0.0.0 --port 5273\"",
    "backend:dev:mock": "cd backend && . venv/bin/activate && UVICORN_MOCK_AUTH=1 uvicorn main:app --reload --port 8000"
  }
}
```

## 10. Frontend Refactors
- Consolidate duplicate pages (`dashboard.jsx` vs `DashboardPage.jsx`). Keep PascalCase. Remove unused.
- Replace placeholder arrays in `ContributionsPage.jsx` & `loans.jsx` with fetched data after endpoints live.
- Add a small `useFetch` or React Query (optional) for caching (#future).

## 11. Testing Matrix
| Area | Test Type | Examples |
|------|-----------|----------|
| User creation | Integration | Admin creates member; role persists |
| Contribution flow | Unit/Integration | Create -> mark-paid updates totals |
| Loan approval | Integration | Request -> approve -> payment -> paid status |
| Stats accuracy | Unit | deficiency edge cases (week 0, partial week) |
| Auth guard | Integration | Deny access to /users (non-admin) |
| Mobile config | Manual | API reachable from emulator |

## 12. Manual QA Checklist
1. Create admin user & login.
2. Create 2 member users.
3. Set weekly contributions.
4. Generate 3 weeks of contributions; mark 2 paid; verify deficiency.
5. Member requests loan; admin approves; member makes payments; final payment sets status=paid.
6. Dashboard reflects updated totals.
7. Mobile build shows same data using LAN API.

## 13. Rollout Strategy
- Develop on feature branches (Phase-labeled) → merge to `main` after tests.
- Tag after major phase completion (v0.1, v0.2...).
- Introduce staging Supabase project before production.

## 14. Potential Future Enhancements
- Real-time updates via Supabase Realtime channels.
- Multi-family (namespace / organization) support.
- Interest or fee logic on loans.
- Automated reminders (email / push) for upcoming due dates.
- Export reports (CSV/PDF) for contributions & loans.

## 15. Quick Start (Once Implemented)
```bash
# Setup
cp .env.example .env
npm install
npm run backend:setup
npm run db:migrate   # wrapper you add to apply migrations
npm run dev:full

# Mobile (LAN IP assumed 192.168.1.50)
export VITE_API_URL=http://192.168.1.50:8000
npm run dev:mobile
# Then cap sync & open platform
npm run mobile:sync
npm run mobile:android
```

## 16. Progress Tracking Template
Maintain a checklist in issues or PR description:
```
[ ] Phase 0 Schema
[ ] Users endpoints
[ ] Contributions endpoints
[ ] Stats/me
[ ] Loans lifecycle
[ ] Family stats
[ ] Auth integration
[ ] RLS policies
[ ] Mobile dev script
[ ] Tests backend
[ ] Tests frontend
[ ] Security audit
```

---
**Next Suggested Action:** Implement Phase 0 (apply schema migration + secure env) and scaffold `routers/users.py`. Let me know and I can start creating those files.
