# customer-code frontend

Stores / Pharmacies UI built with React, Vite, Tailwind CSS, and shadcn/ui.

## Run locally

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- The backend API running and accessible (see `backend/README.md`)

### Install dependencies

```bash
cd frontend
npm install
```

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** The frontend uses relative `/api/` URLs. In development, you need to proxy API calls to the backend. Add a `server.proxy` entry to `vite.config.js`:
>
> ```js
> server: {
>   proxy: {
>     "/api": "http://localhost:5000",
>   },
> },
> ```

### Build for production

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be served by nginx.

## Run with Docker Compose (full stack)

From the **project root**:

```bash
docker compose up --build
```

The app will be available at `http://localhost:8080`.
