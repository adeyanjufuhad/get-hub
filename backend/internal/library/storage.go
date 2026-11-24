// Package library serves the downloadable study-materials catalogue.
// File bytes live in S3-compatible object storage (Neon Object Storage);
// Postgres holds the catalogue (see migration 202611240005).
package library

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/url"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// ErrNotConfigured is returned when the storage env vars are missing.
var ErrNotConfigured = errors.New("library storage is not configured")

// StorageConfig holds the S3-compatible endpoint and credentials.
type StorageConfig struct {
	Endpoint        string // e.g. https://br-xxx.storage.c-10.eu-central-1.aws.neon.tech
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
}

func (c StorageConfig) Enabled() bool {
	return c.Endpoint != "" && c.Bucket != "" && c.AccessKeyID != "" && c.SecretAccessKey != ""
}

// Storage is the subset of object-storage operations the library needs.
type Storage interface {
	Put(ctx context.Context, key string, r io.Reader, size int64, contentType string) error
	Exists(ctx context.Context, key string) (bool, error)
	PresignDownload(ctx context.Context, key, fileName string, ttl time.Duration) (string, error)
}

type s3Storage struct {
	client *minio.Client
	bucket string
}

// NewStorage builds an S3 client for the configured endpoint (path-style, as Neon requires).
func NewStorage(cfg StorageConfig) (Storage, error) {
	if !cfg.Enabled() {
		return nil, ErrNotConfigured
	}
	u, err := url.Parse(cfg.Endpoint)
	if err != nil || u.Host == "" {
		return nil, fmt.Errorf("invalid LIBRARY_S3_ENDPOINT %q", cfg.Endpoint)
	}
	client, err := minio.New(u.Host, &minio.Options{
		Creds:        credentials.NewStaticV4(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		Secure:       u.Scheme != "http",
		Region:       cfg.Region,
		BucketLookup: minio.BucketLookupPath,
	})
	if err != nil {
		return nil, fmt.Errorf("create s3 client: %w", err)
	}
	return &s3Storage{client: client, bucket: cfg.Bucket}, nil
}

func (s *s3Storage) Put(ctx context.Context, key string, r io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, key, r, size, minio.PutObjectOptions{
		ContentType:  contentType,
		CacheControl: "private, max-age=86400",
	})
	return err
}

func (s *s3Storage) Exists(ctx context.Context, key string) (bool, error) {
	_, err := s.client.StatObject(ctx, s.bucket, key, minio.StatObjectOptions{})
	if err == nil {
		return true, nil
	}
	if minio.ToErrorResponse(err).Code == "NoSuchKey" || minio.ToErrorResponse(err).StatusCode == 404 {
		return false, nil
	}
	return false, err
}

func (s *s3Storage) PresignDownload(ctx context.Context, key, fileName string, ttl time.Duration) (string, error) {
	params := url.Values{}
	params.Set("response-content-disposition", ContentDisposition(fileName))
	u, err := s.client.PresignedGetObject(ctx, s.bucket, key, ttl, params)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}

// ContentDisposition builds an attachment header that keeps non-ASCII file names intact.
func ContentDisposition(fileName string) string {
	ascii := strings.Map(func(r rune) rune {
		if r < 0x20 || r > 0x7e || r == '"' || r == '\\' {
			return '_'
		}
		return r
	}, fileName)
	return mime.FormatMediaType("attachment", map[string]string{"filename": ascii}) +
		"; filename*=UTF-8''" + url.PathEscape(fileName)
}
