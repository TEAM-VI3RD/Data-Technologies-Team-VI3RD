# Stage 1: Build Go binary
FROM golang:1.25-alpine AS builder
WORKDIR /app

# Dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy project
COPY . .

# Build binary
RUN go build -o webshop-backend ./cmd/webshop-backend

# Stage 2: Run
FROM alpine:latest
WORKDIR /app

# Copy binary & env
COPY --from=builder /app/webshop-backend .
COPY .env .
COPY wait-for-db.sh .

RUN sed -i 's/\r$//' wait-for-db.sh

# Maak wait script uitvoerbaar
RUN chmod +x wait-for-db.sh

# Expose port
EXPOSE 8080

# Start backend via wait script
CMD ["./wait-for-db.sh"]