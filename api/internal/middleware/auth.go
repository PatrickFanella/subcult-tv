package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UsernameKey contextKey = "username"
	RoleKey     contextKey = "role"
)

// Auth returns middleware that validates JWT tokens.
// revoked, when non-nil, is consulted to reject tokens invalidated by
// server-side logout: it is called with the token subject and its issued-at
// timestamp and must return true to reject the token.
func Auth(secret string, revoked func(userID string, iat int64) bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"missing authorization header","code":401}`, http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				http.Error(w, `{"error":"invalid authorization format","code":401}`, http.StatusUnauthorized)
				return
			}

			tokenStr := parts[1]
			token, err := jwt.Parse(tokenStr,
				func(t *jwt.Token) (interface{}, error) {
					return []byte(secret), nil
				},
				// Lock the algorithm to guard against alg-confusion attacks,
				// and require an `exp` claim so expiry is always validated.
				jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
				jwt.WithExpirationRequired(),
			)
			if err != nil || !token.Valid {
				http.Error(w, `{"error":"invalid or expired token","code":401}`, http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, `{"error":"invalid token claims","code":401}`, http.StatusUnauthorized)
				return
			}

			userID, _ := claims["sub"].(string)
			username, _ := claims["username"].(string)
			role, _ := claims["role"].(string)

			if userID == "" {
				http.Error(w, `{"error":"invalid token subject","code":401}`, http.StatusUnauthorized)
				return
			}

			iat, _ := claims.GetIssuedAt()
			issuedAt := int64(0)
			if iat != nil {
				issuedAt = iat.Unix()
			}

			if revoked != nil && revoked(userID, issuedAt) {
				http.Error(w, `{"error":"token revoked","code":401}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UsernameKey, username)
			ctx = context.WithValue(ctx, RoleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
