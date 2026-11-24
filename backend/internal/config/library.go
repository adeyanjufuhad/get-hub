package config

import "github.com/adeyanjufuhad/get-hub/backend/internal/library"

// LibraryStorage returns the object-storage settings for the notes library.
func (c Config) LibraryStorage() library.StorageConfig {
	return library.StorageConfig{
		Endpoint:        c.LibraryS3Endpoint,
		Region:          c.LibraryS3Region,
		Bucket:          c.LibraryS3Bucket,
		AccessKeyID:     c.LibraryS3AccessKeyID,
		SecretAccessKey: c.LibraryS3SecretAccessKey,
	}
}
