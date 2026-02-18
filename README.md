# stakeholder-management-backend
Customer Code API

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
docker run -p 5000:5000 costumer-code-api
```
