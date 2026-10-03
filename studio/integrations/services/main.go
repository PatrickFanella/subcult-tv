package main

import (
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

//go:embed assets/*
var assets embed.FS

const assetPrefix = "/_subcult/"
const revision = "logo-bcd-20261003"
const maxHTML = 16 << 20

type route struct {
	Upstream string `json:"upstream"`
	Theme    string `json:"theme"`
}

func brandResponse(theme string, res *http.Response) error {
	// APIs, downloads, socket upgrades, streams, errors and partial responses pass through.
	if res.StatusCode != http.StatusOK || !strings.HasPrefix(strings.ToLower(res.Header.Get("Content-Type")), "text/html") || res.Request.Method == http.MethodHead {
		return nil
	}
	encoding := res.Header.Get("Content-Encoding")
	if encoding != "" && encoding != "gzip" {
		return nil
	}
	var reader io.Reader = res.Body
	if encoding == "gzip" {
		gz, err := gzip.NewReader(res.Body)
		if err != nil {
			return err
		}
		defer gz.Close()
		reader = gz
	}
	b, err := io.ReadAll(io.LimitReader(reader, maxHTML+1))
	if err != nil {
		return err
	}
	if len(b) > maxHTML {
		return fmt.Errorf("upstream HTML exceeds branding limit")
	}
	res.Body.Close()
	lower := bytes.ToLower(b)
	if at := bytes.Index(lower, []byte("</head>")); at >= 0 {
		// No inline scripts or styles: keep the original Content-Security-Policy.
		css, _ := assets.ReadFile("assets/" + theme + ".css")
		cssHash := sha256.Sum256(css)
		cssRevision := fmt.Sprintf("%x", cssHash[:8])
		links := []byte(fmt.Sprintf(`<link rel="stylesheet" data-subcult="%s" href="%s%s.css?v=%s"><link rel="icon" type="image/svg+xml" href="%sfavicon.svg?v=%s">`, theme, assetPrefix, theme, cssRevision, assetPrefix, revision))
		b = append(append(append([]byte{}, b[:at]...), links...), b[at:]...)
	}
	res.Body = io.NopCloser(bytes.NewReader(b))
	res.ContentLength = int64(len(b))
	res.Header.Set("Content-Length", strconv.Itoa(len(b)))
	res.Header.Del("Content-Encoding")
	res.Header.Del("ETag")
	res.Header.Del("Last-Modified")
	res.Header.Del("Content-MD5")
	res.Header.Set("Cache-Control", "no-store")
	res.Header.Set("X-Subcult-Brand", revision)
	return nil
}

func newHandler(routes map[string]route) (http.Handler, error) {
	proxies := map[string]*httputil.ReverseProxy{}
	for host, r := range routes {
		u, err := url.Parse(r.Upstream)
		if err != nil || u.Scheme != "http" || u.Host == "" {
			return nil, fmt.Errorf("invalid upstream for %s", host)
		}
		theme := r.Theme
		p := &httputil.ReverseProxy{
			Rewrite: func(pr *httputil.ProxyRequest) {
				pr.SetURL(u)
				pr.Out.Host = pr.In.Host
				// Caddy is the sole ingress. Keep its forwarded identity/protocol; do not
				// substitute the sidecar's IP or disturb an application's trusted proxies.
				for _, key := range []string{"X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto"} {
					if v := pr.In.Header.Values(key); len(v) > 0 {
						pr.Out.Header[key] = append([]string{}, v...)
					}
				}
				pr.Out.Header.Set("Accept-Encoding", "identity")
				if strings.Contains(pr.In.Header.Get("Accept"), "text/html") {
					pr.Out.Header.Del("If-None-Match")
					pr.Out.Header.Del("If-Modified-Since")
				}
			},
			ModifyResponse: func(res *http.Response) error { return brandResponse(theme, res) },
			ErrorHandler: func(w http.ResponseWriter, req *http.Request, err error) {
				// Never log request bodies, credentials, cookies or query strings.
				log.Printf("upstream unavailable host=%s: %v", req.Host, err)
				http.Error(w, "Service temporarily unavailable", http.StatusBadGateway)
			},
		}
		proxies[host] = p
	}
	sub, _ := fs.Sub(assets, "assets")
	files := http.StripPrefix(assetPrefix, http.FileServer(http.FS(sub)))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/_health" {
			w.Write([]byte("ok\n"))
			return
		}
		host := strings.ToLower(strings.Split(r.Host, ":")[0])
		p, ok := proxies[host]
		if !ok {
			http.NotFound(w, r)
			return
		}
		if strings.HasPrefix(r.URL.Path, assetPrefix) {
			if r.Method != "GET" && r.Method != "HEAD" {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}
			name := strings.TrimPrefix(r.URL.Path, assetPrefix)
			if name == "" || strings.Contains(name, "/") || strings.Contains(name, "..") {
				http.NotFound(w, r)
				return
			}
			w.Header().Set("Cache-Control", "public, max-age=3600")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			files.ServeHTTP(w, r)
			return
		}
		p.ServeHTTP(w, r)
	}), nil
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "-check" {
		c := http.Client{Timeout: 3 * time.Second}
		r, err := c.Get("http://127.0.0.1:8080/_health")
		if err != nil {
			os.Exit(1)
		}
		r.Body.Close()
		if r.StatusCode != 200 {
			os.Exit(1)
		}
		return
	}
	b, err := os.ReadFile("/routes.json")
	if err != nil {
		log.Fatal(err)
	}
	var routes map[string]route
	if err = json.Unmarshal(b, &routes); err != nil {
		log.Fatal(err)
	}
	h, err := newHandler(routes)
	if err != nil {
		log.Fatal(err)
	}
	s := &http.Server{Addr: ":8080", Handler: h, ReadHeaderTimeout: 15 * time.Second, IdleTimeout: 90 * time.Second}
	log.Printf("SUBCULT Studio branding: %d hosts", len(routes))
	log.Fatal(s.ListenAndServe())
}
