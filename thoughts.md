# Thoughts

- At this stage I'm uploading to Docker Hub. Let's try Harbor as he self-hosted alternative.


or a Python Flask app like this one, a typical test job covers:

1. Code quality / linting

flake8 or ruff — checks code style and catches obvious errors
black --check — enforces formatting

2. Security scanning

bandit — scans for common security issues in Python code (SAST)
pip-audit — checks dependencies for known CVEs (SCA)

3. Unit tests

Test individual functions/methods in isolation
Database calls are usually mocked (with unittest.mock or pytest-mock), so no real DB needed

4. Integration tests

Test routes end-to-end (e.g. GET /api/v1/stores returns 200)
This is where a real database service is needed, because you're testing the full stack — Flask → SQLAlchemy → Postgres
For your app, this would test the stores blueprint against a real schema

5. Coverage report

pytest --cov — fails the job if coverage drops below a threshold (e.g. 80%)
For your app specifically, the minimum useful setup would be:


lint (ruff/flake8)  →  unit tests (mocked DB)  →  integration tests (real Postgres)
The reason the original workflow included Postgres was specifically for integration tests (step 4). If you only write unit tests with mocks, you can drop the service entirely.