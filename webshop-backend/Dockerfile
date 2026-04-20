# =============================================================================
# Stage 1 — Build
# =============================================================================
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Download dependencies first (layer-cached until go.mod/go.sum change).
COPY go.mod go.sum ./
RUN go mod download

# Copy source and compile a statically-linked binary.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o webshop-backend ./cmd/webshop-backend

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM alpine:3.21

WORKDIR /app

# netcat (nc) is required by wait-for-db.sh to poll the DB port.
RUN apk add --no-cache netcat-openbsd

# Copy only what the container needs at runtime.
COPY --from=builder /app/webshop-backend .

EXPOSE 8080

CMD ["./webshop-backend"]
