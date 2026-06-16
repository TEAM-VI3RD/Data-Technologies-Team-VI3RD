package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// MongoDB is the shared database handle used by all MongoDB repositories.
var MongoDB *mongo.Database

// ConnectMongo reads env vars, opens the MongoDB connection, and verifies
// reachability with Ping. The app exits if the connection cannot be established.
func ConnectMongo() {
	// Env-vars worden geladen in main() via godotenv — hier geen actie nodig.
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB")

	if uri == "" || dbName == "" {
		log.Fatal("Missing required MongoDB env vars: MONGO_URI, MONGO_DB")
	}

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Cannot connect to MongoDB: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Cannot reach MongoDB at %s — %v", uri, err)
	}

	MongoDB = client.Database(dbName)
	log.Printf("MongoDB connected (db=%s)", dbName)
}

// Payments returns the payments collection.
func Payments() *mongo.Collection {
	return MongoDB.Collection("payments")
}
