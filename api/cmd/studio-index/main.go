package main

import (
	"context"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/handlers"
	"log"
	"os"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	pool, err := database.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err = database.Migrate(ctx, pool); err != nil {
		log.Fatal(err)
	}
	h := &handlers.Handler{DB: pool, StudioRoot: os.Getenv("STUDIO_ROOT")}
	count, err := h.SyncStudioReferences(ctx)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Indexed %d Studio references", count)
}
