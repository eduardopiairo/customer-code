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

## Testing

Install dev dependencies:

```bash
pip install -r requirements-dev.txt
```

Run unit tests:

```bash
pytest --tb=short
```

Run with coverage report:

```bash
pytest --cov=src --cov-report=term-missing --tb=short
```

## Linting

Install dev dependencies:

```bash
pip install -r requirements-dev.txt
```

Check for lint errors:

```bash
ruff check src
```

Auto-fix fixable issues:

```bash
ruff check src --fix
```

## Security

Scan source code for security issues:

```bash
bandit -r src
```

Check dependencies for known CVEs:

```bash
pip-audit -r requirements.txt
```

## Codacy

This project uses [Codacy](https://www.codacy.com/) for automated code quality and static analysis.

Codacy analyses every pull request and reports on code style issues, duplication, complexity, and security patterns. The Codacy badge on the repository reflects the current grade of the `main` branch.

To view results, open the Codacy dashboard for this repository. No local setup is required — analysis runs automatically via the Codacy GitHub integration on each push and pull request.

## Dependabot

[Dependabot](https://docs.github.com/en/code-security/dependabot) is enabled on this repository to keep dependencies up to date and to surface known vulnerabilities.

It is configured to:

- Open pull requests automatically when new versions of Python packages in `requirements.txt` and `requirements-dev.txt` are released.
- Alert on any dependency with a published CVE.

Dependabot pull requests follow the same review and CI process as regular PRs. Merge them after verifying that tests pass and no breaking changes are introduced.

## Run with Docker Compose (full stack)

From the **project root**:

```bash
docker compose up --build
```
