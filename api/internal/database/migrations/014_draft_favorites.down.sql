DELETE FROM draft_decisions WHERE decision = 'favorited';
ALTER TABLE draft_decisions DROP CONSTRAINT IF EXISTS draft_decisions_decision_check;
ALTER TABLE draft_decisions ADD CONSTRAINT draft_decisions_decision_check
    CHECK (decision IN ('approved_as_is', 'approved_edited', 'rejected', 'revision_requested', 'snoozed'));
