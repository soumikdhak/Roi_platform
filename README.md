# ROI Platform — Investment & Referral Management System(Repo Link - https://github.com/soumikdhak/Roi_platform)

### A full-stack MERN (TypeScript) platform for managing daily-ROI investments and multi-level referral income, built for the Nexachain AI technical assessment.

***Tech stack:*** MongoDB, Express.js, React.js, Node.js, TypeScript, Redux Toolkit, node-cron

## 1. Project setup steps
```cmd
git clone https://github.com/soumikdhak/Roi_platform.git
cd Roi_platform
npm install
```

***Create a .env file in the root (see Environment variables below).***
```cmd
npm run dev
```

### The API server starts on http://localhost:8000 (or whatever PORT you set).

***Note - MongoDB must be a replica set (a single-node replica set works for local development) — the app uses MongoDB transactions for wallet-balance updates, which are not supported on a standalone instance. MongoDB Atlas clusters are replica sets by default.***

## 2. Environment variables
 
Create a `.env` file in the backend root with the following:
 
| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string (must point to a replica set) | `mongodb://user:<password>@host:27017/?replicaSet=...` |
| `PORT` | Port the backend server runs on | `8000` |
| `MAX_RETRIES` | Max DB connection retry attempts on startup | `3` |
| `CORS_ORIGIN` | Allowed origin(s) for CORS | `*` (or your frontend URL in production) |
| `ACCESS_TOKEN_SECRET` | Secret used to sign JWT access tokens | *(generate your own — do not reuse examples)* |
| `ACCESS_TOKEN_EXPIRY` | Access token lifetime | `1d` |
| `REFRESH_TOKEN_SECRET` | Secret used to sign JWT refresh tokens | *(generate your own)* |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime | `10d` |
| `REFERREL_LEVEL` | Number of referral levels paid out per ROI event | `3` |
 
**Never commit your `.env` file.** Confirm it's listed in `.gitignore` before your first commit — the values above are secrets, not documentation of real credentials.
 
---

## 3. API documentation

***All protected routes require a valid JWT, set an accessToken cookie (set automatically on login/register).***

### Auth


| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/v1/users/register` | Register a new user (optionally with a referral code) | No |
| POST | `/api/v1/users/login` | Log in, returns access + refresh tokens as cookies | No |
| POST | `api/v1/users/logout` | log out, clear all cookies | Yes
| POST | `api/v1/users/refreshAccessToken` | Generate new access token if the lifetime ends | Yes
| GET | `api/v1/users/fetchDirectReferral` | fetch direct referrel of user | Yes
| GET | `api/v1/users/fetchReferralTree` | fetch full referal tree | Yes
| GET | `api/v1/users/dashboard` | fetch user dashboard data | Yes
| GET | `api/v1/users/chartData` | fetch user's last 7 days total Income | Yes

### Investments
 
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/v1/investments/createInvestment` | Create a new investment; deducts the amount from wallet balance | Yes |
| GET | `/api/v1/investments/getAllInvestments?sort=newest\|oldest` |  logged-in user's investments filtered on newest and oldest| Yes |

### ROI History
 
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/v1/ROI/generateDailyRoi` | generate daily rate of interest income docs | Yes |
| GET | `api/v1/ROI/rois?date=&roiCode=&sort=&page=&limit=` | get list of Roi history with pagination(filtered based on date, investment code, page, limit) | Yes |

### Referral Income
 
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/v1/RLI/genarateRli` | generate daily referrel level income based on ROI | Yes |
| GET | `api/v1/RLI/rlis?date=&roiCode=&sort=&page=&limit=` | get list of Referral incomes with pagination(filtered based on date, investment code, page, limit) | Yes |
                    
### Viewing API documentation (Swagger)

Generate the Swagger spec, then start the server:

```bash
npm run swagger
npm run dev
```

Once running, open the interactive API docs at:

```
http://localhost:8000/api_docs
```
 ***get all endpoints***


## 4. Assumptions made during development
 
- **Referral/level income is calculated as a percentage of each daily ROI payout**, not a one-time percentage of the investment principal — so a user's upline earns a recurring cut of ROI every day the downline's investment stays active, not a single bonus at signup.
- **Referral payout depth** is configurable via `REFERREL_LEVEL` (default 3); payout percentage decreases by level (e.g. level 1 = 5%, level 2 = 3%, level 3 = 1%).
- If the daily cron job misses a run and later finds `today > investment.endDate`, **no ROI is credited for the missed days** — the investment is simply marked `Completed` without a retroactive payout, to avoid overpaying beyond the agreed term.
- **Investing deducts the amount from the user's wallet balance** at creation time (wallet must have sufficient balance); ROI and referral income are credited back into the wallet daily over the investment's term.
- **User codes, investment codes, ROI codes, and referral-income identifiers** are sequential, zero-padded strings, generated via an atomic counter to avoid collisions under concurrent requests.
- **Idempotency** for both daily ROI crediting and referral-income distribution is enforced at two levels: an application-level existence check before insert, and a compound unique index at the database level (`{ investmentCode, date }` on ROI history; `{ roiCode, toUser }` on referral income) as a hard backstop against duplicate payouts.
- **MongoDB transactions** are used wherever a ledger entry (ROI credit, referral income, investment creation) and a wallet balance update must succeed or fail together — this requires a replica-set-enabled MongoDB instance rather than a standalone one.
- **Dates on ROI and referral-income records are stored as plain `YYYY-MM-DD` strings**, not `Date` objects, to avoid timezone/precision mismatches when checking "has this already been processed today."
- The cron job runs daily at **12:01 AM IST** (`Asia/Kolkata`), first processing daily ROI for all active investments, then distributing referral income based on that day's credited ROI.
- `accountStatus` uses a string field (e.g. `"Active"`) rather than a boolean, to support richer status states (e.g. suspended, blocked) for future admin/compliance use.
