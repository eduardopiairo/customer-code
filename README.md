# Costumer Code Management
Customer relations management API for pharmacy stores.

## Quick Start

Run the full stack (API, frontend, and database) with a single command:

```bash
docker compose up --build
```

The frontend will be available at `http://localhost:8080`.

To stop and remove containers:

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

## Setup

### Create a virtual environment

```bash
python -m venv venv
```

### Activate the virtual environment

**macOS / Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Deactivate the virtual environment

```bash
deactivate
```

## Docker

### Build the image

```bash
docker build -t customer-code-api .
```

### Run the container

```bash
docker run -p 8080:5000 customer-code-api
```
