# TechCycle Webshop

TechCycle is een webshopproject voor INFDTS01 Data Technologies. De applicatie
bestaat uit een Go/Gin REST API, een React/TypeScript frontend, PostgreSQL voor
relationele webshopdata en MongoDB voor paymentdocumenten.

## Belangrijkste Functionaliteiten

- Registreren en inloggen met bcrypt-wachtwoordhashes en JWT-authenticatie.
- Productcatalogus met zoeken, filteren, categorieen en adminbeheer.
- Winkelwagen met voorraadcontrole.
- Order-flow met transacties, rijlocks, prijssnapshot en voorraadmutaties.
- Payments in MongoDB.
- Retouraanvragen en adminbeheer.
- Swagger documentatie op `/swagger/index.html`.

## Databases

PostgreSQL wordt gebruikt voor de kern van de webshop: gebruikers, producten,
categorieen, adressen, winkelwagens, orders, orderregels en retouren. Het schema
staat in `webshop-backend/migrations` en bevat foreign keys, unique constraints,
check constraints en indexes.

MongoDB wordt gebruikt voor payments. Payments hebben documentachtige velden,
zoals status, betaalmethode, transaction id en optionele `paid_at`, en zijn
functioneel gekoppeld aan orders via `order_id`.

## Order-Flow SQL

De order-flow is een belangrijk technisch bewijsstuk voor de beoordeling:

- `PlaceOrder` draait volledig binnen een database-transactie.
- Productrijen worden gelezen met `FOR UPDATE OF p` om overselling bij
  gelijktijdige bestellingen te voorkomen.
- `ORDER BY p.id` geeft een vaste lockvolgorde en verlaagt deadlockrisico.
- `order_items.unit_price` bewaart de prijs op het moment van bestellen.
- Na een succesvolle order wordt de winkelwagen geleegd.
- Admin endpoint `GET /admin/orders/report` gebruikt een geavanceerde query met
  CTEs, aggregatie en window functions.

Het reproduceerbare SQL-bewijs staat in:

```text
webshop-backend/docs/sql/order_flow_explain.sql
```

<!-- Gebruik dit bestand om `EXPLAIN (ANALYZE, BUFFERS)` output te verzamelen voor
het technisch rapport en testrapport. -->

## Run With Docker

1. Open een terminal in `webshop-backend`.
2. Maak indien nodig een lokale `.env` op basis van `webshop-backend/.env.example`.
3. Start de stack:

```bash
docker compose up --build
```

4. Open de API op `http://localhost:8080`.
5. Open Swagger op `http://localhost:8080/swagger/index.html`.

De backendcontainer verbindt met PostgreSQL via `db:5432`. Als de backend buiten
Docker wordt gestart, gebruikt de lokale configuratie meestal `localhost:5433`.

## Verificatie

Backend:

```bash
cd webshop-backend
go test ./...
```

Frontend:

```bash
cd webshop-frontend
npm.cmd run build
```

Testbewijs staat in `testrapport.docx`. Het testrapport beschrijft handmatige
tests via de UI en Swagger, inclusief de kritieke bestel-, voorraad-, auth-,
admin- en paymentflows.
