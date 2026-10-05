ALTER TABLE social_review_drafts DROP COLUMN IF EXISTS image_choice;
ALTER TABLE social_review_drafts DROP COLUMN IF EXISTS original_caption;
DROP TABLE IF EXISTS draft_decisions;
