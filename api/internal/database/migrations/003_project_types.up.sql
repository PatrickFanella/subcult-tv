-- Older installations use one category; production already uses text arrays.
-- Preserve every category and make both installations share the same contract.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'projects'
          AND column_name = 'type' AND data_type <> 'ARRAY'
    ) THEN
        ALTER TABLE projects ALTER COLUMN type DROP DEFAULT;
        ALTER TABLE projects ALTER COLUMN type TYPE TEXT[] USING ARRAY[type::text];
    END IF;
    ALTER TABLE projects ALTER COLUMN type SET DEFAULT ARRAY['software']::text[];
END $$;
