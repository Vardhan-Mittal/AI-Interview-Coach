package routes

import (
	"net/http"

	"github.com/ai-interview-coach/backend/internal/interview"
	"github.com/ai-interview-coach/backend/internal/job"
	"github.com/ai-interview-coach/backend/internal/middleware"
	"github.com/ai-interview-coach/backend/internal/report"
	"github.com/ai-interview-coach/backend/internal/resume"
	"github.com/gin-gonic/gin"
)

// SetupRouter creates and configures the Gin router with all API routes.
func SetupRouter(
	corsOrigin string,
	resumeHandler *resume.Handler,
	interviewHandler *interview.Handler,
	reportHandler *report.Handler,
	jobHandler *job.Handler,
) *gin.Engine {
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORSMiddleware(corsOrigin))

	// Health check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "AI Interview Coach",
			"version": "1.4.0 (groq tpm-shield engine)",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Resume endpoints
		resumeGroup := api.Group("/resume")
		{
			resumeGroup.POST("/upload", resumeHandler.Upload)
			resumeGroup.POST("/analyze", resumeHandler.Analyze)
			resumeGroup.POST("/roast", resumeHandler.Roast)
		}

		// Job endpoints
		jobGroup := api.Group("/job")
		{
			jobGroup.POST("/match", jobHandler.Match)
		}

		// Interview endpoints
		interviewGroup := api.Group("/interview")
		{
			interviewGroup.POST("/start", interviewHandler.Start)
			interviewGroup.POST("/answer", interviewHandler.SubmitAnswer)
			interviewGroup.GET("/:id/status", interviewHandler.GetStatus)
		}

		// Report endpoints
		reportGroup := api.Group("/report")
		{
			reportGroup.GET("/:sessionId", reportHandler.GetReport)
		}
	}

	return router
}
