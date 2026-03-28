# Portfolio Manager

A full-stack stock portfolio tracker built with Django + React. Tracks holdings, dividends, beta, and price changes using live data from the Financial Modeling Prep API.

Incoming features will include stock fundamental analysis, option strategy P/L simulator, price predictions, crypto/commodity/bond etc


## Tech Stack

- **Backend:** Django 5.1, Django REST Framework
- **Frontend:** React 18, Redux Toolkit, TypeScript, Material UI 5, Vite
- **Database:** PostgreSQL 16
- **Proxy:** Nginx
- **Containerization:** Docker Compose

## Docker Setup (Recommended)

### Prerequisites

- Docker and Docker Compose installed

### Steps

1. Clone the repo and create a `.env` file in the project root:

```
POSTGRES_DB=portfolio_db
POSTGRES_USER=portfolio_user
POSTGRES_PASSWORD=your_db_password
DJANGO_SECRET_KEY=your_django_secret_key
DJANGO_DEBUG=1
FMP_API_KEY=your_fmp_api_key
```

2. Build and start all services:

```bash
docker-compose up --build -d
```

This starts 4 containers:
- **db** (PostgreSQL) on port 5432
- **backend** (Django) on port 8000
- **frontend** (Vite dev server) on port 5173
- **nginx** (reverse proxy) on port 80

Migrations run automatically on backend startup.

3. Open `http://localhost` in your browser.

### Useful Commands

```bash
docker-compose logs backend --tail 50     # View backend logs
docker-compose exec backend python manage.py createsuperuser  # Create admin user
docker-compose down                       # Stop all services
docker-compose down -v                    # Stop and delete database volume
```

## Local Development (Without Docker)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set environment variables (or create `.env` in project root):

```bash
export POSTGRES_DB=portfolio_db
export POSTGRES_USER=portfolio_user
export POSTGRES_PASSWORD=your_db_password
export DJANGO_SECRET_KEY=your_django_secret_key
export DJANGO_DEBUG=1
export FMP_API_KEY=your_fmp_api_key
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Financial Modeling Prep (FMP) API

This application uses the [FMP API](https://financialmodelingprep.com/) to fetch live stock data. You need a free or paid API key from their site.

### Configuration

- Store your key as `FMP_API_KEY` in the `.env` file
- The backend reads it via `django.conf.settings.FMP_API_KEY`

### API Details

- **Base URL:** `https://financialmodelingprep.com/stable/`
- **Auth:** `apikey` header (not query parameter, not `X-API-KEY`)
- **Endpoint format:** Uses the `/stable/` API, not `/api/v3/`

### Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /stable/profile?symbol=X` | Company profile, beta, price, dividend |
| `GET /stable/ratios-ttm?symbol=X` | Financial ratios (P/E, margins, etc.) |
| `GET /stable/key-metrics-ttm?symbol=X` | Key metrics (ROE, ROIC, EV ratios) |
| `GET /stable/dividends?symbol=X` | Historical dividend payments |
| `GET /stable/search-symbol?query=X` | Symbol search |
| `GET /stable/search-exchange-variants?symbol=X` | Exchange variants for a symbol |

### Auto-Fetched Data

When a stock is added or updated, the backend automatically fetches from FMP:

- **company_name** from `companyName`
- **dividend_rate** from `lastDividend`
- **beta** from `beta`
- **current_price** from `price`

No manual entry needed for these fields.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stocks/` | List all stocks |
| POST | `/api/stocks/` | Add stock (only ticker, avg_price, quantity required) |
| PUT | `/api/stocks/{id}/` | Update stock |
| DELETE | `/api/stocks/{id}/` | Delete stock |
| GET | `/api/stocks/summary/` | Portfolio totals |
| GET | `/api/stocks/portfolio-stats/` | Live beta, monthly dividends from FMP |
| GET | `/api/fundamentals/{ticker}/` | Company fundamentals |
| GET | `/api/search/symbol/?query=X` | Search symbols |
| GET | `/api/search/exchange-variants/?symbol=X` | Exchange variants |
