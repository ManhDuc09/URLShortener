package models

type ShortURL struct {
	ID          int
	OriginalURL string
	ShortCode   string
	UserID      int
	Clicks      int
}
