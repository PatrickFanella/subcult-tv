-- Self-replies scheduled with an X post as one Buffer thread.
ALTER TABLE buffer_schedules ADD COLUMN replies TEXT[] NOT NULL DEFAULT '{}';
