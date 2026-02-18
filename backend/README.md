# customer-code backend

REST API built with Flask and PostgreSQL for the Customer Code application.

## Prerequisites

- Python 3.12+
- PostgreSQL running and accessible

## Run locally

### Create and activate a virtual environment

```bash
cd backend
python -m venv venv
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure the database

Set the `DATABASE_URL` environment variable pointing to your PostgreSQL instance:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/pharmacies
```

### Start the development server

```bash
python src/app.py
```

The API will be available at `http://localhost:5000`.

> The database tables are created automatically on startup via `db.create_all()`.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/details` | App details |
| GET | `/api/v1/stores` | List all stores |
| POST | `/api/v1/stores` | Create a store |
| GET | `/api/v1/stores/<id>` | Get a store |
| PUT | `/api/v1/stores/<id>` | Update a store |
| DELETE | `/api/v1/stores/<id>` | Delete a store |

## Run with Docker Compose (full stack)

From the **project root**:

```bash
docker compose up --build
```
