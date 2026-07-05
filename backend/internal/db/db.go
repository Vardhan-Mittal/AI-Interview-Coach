package db

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/ai-interview-coach/backend/internal/config"
	"github.com/ai-interview-coach/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Init connects to the configured database (PostgreSQL or SQLite) and runs auto-migrations.
func Init(cfg *config.Config) (*gorm.DB, error) {
	var dialect gorm.Dialector
	dbURL := cfg.DatabaseURL
	if dbURL == "" {
		dbURL = "file:interview_coach.db"
	}

	if strings.HasPrefix(dbURL, "postgres://") || strings.HasPrefix(dbURL, "postgresql://") || strings.HasPrefix(dbURL, "host=") {
		slog.Info("Connecting to PostgreSQL database")
		dialect = postgres.Open(dbURL)
	} else {
		sqlitePath := strings.TrimPrefix(dbURL, "file:")
		if strings.HasPrefix(sqlitePath, "sqlite://") {
			sqlitePath = strings.TrimPrefix(sqlitePath, "sqlite://")
		}
		slog.Info("Connecting to local SQLite database fallback", "path", sqlitePath)
		dialect = sqlite.Open(sqlitePath)
	}

	gormCfg := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	db, err := gorm.Open(dialect, gormCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Run auto-migrations
	slog.Info("Running database auto-migrations...")
	err = db.AutoMigrate(
		&models.User{},
		&models.ResumeEntity{},
		&models.InterviewSessionEntity{},
		&models.ReportEntity{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run database migrations: %w", err)
	}

	slog.Info("Database initialized and migrated successfully")
	return db, nil
}
