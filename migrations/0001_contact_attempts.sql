CREATE TABLE contact_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_hash TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);

CREATE INDEX idx_contact_attempts_client_time
  ON contact_attempts (client_hash, attempted_at);
