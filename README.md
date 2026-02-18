# stakeholder-management-backend
Customer relations management API for the pharmaceutical and skin care industry.

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
