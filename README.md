# Data-Technologies-Team-VI3RD
Repository for our Web Shop project for school

## Run with Docker

1. Open a terminal in `webshop-backend`.
2. Make sure `webshop-backend/.env` contains the database credentials you want to use. The existing values work for local Docker development.
3. Start the stack:

```bash
docker compose up --build
```

4. Open the API at `http://localhost:8080` and Swagger at `http://localhost:8080/swagger/index.html`.

The backend container now connects to the database service as `db:5432`, while running the app outside Docker still uses `localhost:5433` from `.env`.
