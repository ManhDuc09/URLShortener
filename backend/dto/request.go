package dto

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ShortenRequest struct {
	URL    string `json:"url"`
	UserID int    `json:"user_id"`
}

type DeleteRequest struct {
	Code   string `json:"code"`
	UserID int    `json:"user_id"`
}
