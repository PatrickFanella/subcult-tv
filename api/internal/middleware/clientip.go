package middleware

import (
	"context"
	"net"
	"net/http"
	"strconv"
	"strings"
)

// ClientIPKey holds the derived client IP (host only, no port) in the request context.
const ClientIPKey contextKey = "client_ip"

// DefaultTrustedProxyCIDRs are the networks a reverse proxy may speak from
// when no TRUSTED_PROXY_CIDRS is configured: loopback, RFC 1918 and IPv6 ULA.
// This API only runs behind a reverse proxy on a private Docker network.
var DefaultTrustedProxyCIDRs = []string{
	"127.0.0.0/8", "::1/128",
	"10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
	"fc00::/7",
}

// ParseCIDRs parses a comma-separated or slice list of CIDRs. A bare address
// is accepted as a single-host network. Blank entries are ignored.
func ParseCIDRs(values []string) ([]*net.IPNet, error) {
	var nets []*net.IPNet
	for _, raw := range values {
		for _, value := range strings.Split(raw, ",") {
			value = strings.TrimSpace(value)
			if value == "" {
				continue
			}
			if !strings.Contains(value, "/") {
				if ip := net.ParseIP(value); ip != nil {
					bits := 32
					if ip.To4() == nil {
						bits = 128
					}
					value += "/" + strconv.Itoa(bits)
				}
			}
			_, network, err := net.ParseCIDR(value)
			if err != nil {
				return nil, err
			}
			nets = append(nets, network)
		}
	}
	return nets, nil
}

func inAny(ip net.IP, nets []*net.IPNet) bool {
	if ip == nil {
		return false
	}
	for _, n := range nets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

// remoteHost returns the host part of RemoteAddr without the port.
func remoteHost(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		return strings.Trim(remoteAddr, "[]")
	}
	return host
}

// ResolveClientIP derives the client address: the RemoteAddr host, or, when
// that host is a trusted proxy, the right-most X-Forwarded-For entry that is
// not itself a trusted proxy. True-Client-IP and X-Real-IP are ignored because
// any client can send them. An unparsable or missing result falls back to the
// RemoteAddr host so the caller always has a key.
func ResolveClientIP(r *http.Request, trusted []*net.IPNet) string {
	host := remoteHost(r.RemoteAddr)
	if !inAny(net.ParseIP(host), trusted) {
		return host
	}
	var hops []string
	for _, header := range r.Header.Values("X-Forwarded-For") {
		for _, part := range strings.Split(header, ",") {
			if part = strings.TrimSpace(part); part != "" {
				hops = append(hops, part)
			}
		}
	}
	for i := len(hops) - 1; i >= 0; i-- {
		candidate := remoteHost(hops[i])
		ip := net.ParseIP(candidate)
		if ip == nil {
			// A malformed hop ends the walk; the nearest trusted proxy is the key.
			return host
		}
		if !inAny(ip, trusted) {
			return ip.String()
		}
	}
	return host
}

// ClientIP stores the derived client IP in the request context for the rate
// limiter and logger. It never rewrites RemoteAddr.
func ClientIP(trusted []*net.IPNet) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), ClientIPKey, ResolveClientIP(r, trusted))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// ClientIPFrom returns the derived client IP, or the RemoteAddr host when the
// ClientIP middleware did not run.
func ClientIPFrom(r *http.Request) string {
	if ip, ok := r.Context().Value(ClientIPKey).(string); ok && ip != "" {
		return ip
	}
	return remoteHost(r.RemoteAddr)
}
