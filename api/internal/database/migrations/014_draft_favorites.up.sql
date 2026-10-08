-- Let the owner mark a draft as particularly good, for the drafting pipeline.
ALTER TABLE draft_decisions DROP CONSTRAINT IF EXISTS draft_decisions_decision_check;
ALTER TABLE draft_decisions ADD CONSTRAINT draft_decisions_decision_check
    CHECK (decision IN ('approved_as_is', 'approved_edited', 'rejected', 'revision_requested', 'snoozed', 'favorited'));
