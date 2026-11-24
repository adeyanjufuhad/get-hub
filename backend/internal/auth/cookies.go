package auth

import (
	"net/http"
	"time"
)

const (
	AccessCookieName     = "gethub_access"
	RefreshCookieName    = "gethub_refresh"
	OAuthStateCookieName = "gethub_oauth_state"
)

// CookieConfig controls security attributes on auth cookies.
type CookieConfig struct {
	Secure   bool
	Domain   string
	SameSite http.SameSite
}

func DefaultCookieConfig(secure bool, domain string) CookieConfig {
	return CookieConfig{
		Secure:   secure,
		Domain:   domain,
		SameSite: http.SameSiteLaxMode,
	}
}

func SetAuthCookies(w http.ResponseWriter, cfg CookieConfig, accessToken string, accessTTL time.Duration, refreshToken string, refreshTTL time.Duration) {
	http.SetCookie(w, &http.Cookie{
		Name:     AccessCookieName,
		Value:    accessToken,
		Path:     "/",
		Domain:   cfg.Domain,
		MaxAge:   int(accessTTL.Seconds()),
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: cfg.SameSite,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     RefreshCookieName,
		Value:    refreshToken,
		Path:     "/api/v1/auth",
		Domain:   cfg.Domain,
		MaxAge:   int(refreshTTL.Seconds()),
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: cfg.SameSite,
	})
}

func ClearAuthCookies(w http.ResponseWriter, cfg CookieConfig) {
	http.SetCookie(w, &http.Cookie{
		Name:     AccessCookieName,
		Value:    "",
		Path:     "/",
		Domain:   cfg.Domain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: cfg.SameSite,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     RefreshCookieName,
		Value:    "",
		Path:     "/api/v1/auth",
		Domain:   cfg.Domain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: cfg.SameSite,
	})
}

func SetOAuthStateCookie(w http.ResponseWriter, cfg CookieConfig, state string) {
	http.SetCookie(w, &http.Cookie{
		Name:     OAuthStateCookieName,
		Value:    state,
		Path:     "/api/v1/auth/google",
		Domain:   cfg.Domain,
		MaxAge:   600, // 10 minutes
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: sameSiteOrLax(cfg.SameSite),
	})
}

func ClearOAuthStateCookie(w http.ResponseWriter, cfg CookieConfig) {
	http.SetCookie(w, &http.Cookie{
		Name:     OAuthStateCookieName,
		Value:    "",
		Path:     "/api/v1/auth/google",
		Domain:   cfg.Domain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.Secure,
		SameSite: sameSiteOrLax(cfg.SameSite),
	})
}

func sameSiteOrLax(s http.SameSite) http.SameSite {
	if s == 0 {
		return http.SameSiteLaxMode
	}
	return s
}
