ALTER TABLE activities
ADD COLUMN processed_outside_hours BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN activities.processed_outside_hours IS 'Indicates if the redemption was processed outside of allowed hours';