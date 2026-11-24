package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var ErrGoogleOAuthDisabled = errors.New("google oauth is not configured")

// GoogleUserInfo contains identity claims fetched from Google.
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
}

// GoogleOAuth handles OAuth2 redirects and userinfo retrieval.
type GoogleOAuth struct {
	oauthCfg *oauth2.Config
}

func NewGoogleOAuth(clientID, clientSecret, redirectURL string) *GoogleOAuth {
	if clientID == "" || clientSecret == "" {
		return &GoogleOAuth{oauthCfg: nil}
	}
	return &GoogleOAuth{
		oauthCfg: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (g *GoogleOAuth) Enabled() bool {
	return g != nil && g.oauthCfg != nil
}

func (g *GoogleOAuth) AuthCodeURL(state string) (string, error) {
	if !g.Enabled() {
		return "", ErrGoogleOAuthDisabled
	}
	return g.oauthCfg.AuthCodeURL(state, oauth2.AccessTypeOnline), nil
}

func (g *GoogleOAuth) ExchangeAndFetchUser(ctx context.Context, code string) (*GoogleUserInfo, error) {
	if !g.Enabled() {
		return nil, ErrGoogleOAuthDisabled
	}
	token, err := g.oauthCfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("exchange google code: %w", err)
	}

	client := g.oauthCfg.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("fetch google userinfo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google userinfo returned status %d", resp.StatusCode)
	}

	var info GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("decode google userinfo: %w", err)
	}
	if info.ID == "" || info.Email == "" {
		return nil, errors.New("incomplete google userinfo payload")
	}
	return &info, nil
}
