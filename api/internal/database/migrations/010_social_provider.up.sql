-- Retain legacy Postiz receipts; new approvals identify their provider.
ALTER TABLE social_schedules ADD COLUMN provider TEXT NOT NULL DEFAULT 'postiz';
