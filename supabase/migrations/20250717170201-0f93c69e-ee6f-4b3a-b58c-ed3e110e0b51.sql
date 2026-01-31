-- Update restaurant referer_id to be the manager's referer_id
UPDATE restaurants 
SET referer_id = (
    SELECT p.referer_id 
    FROM profiles p 
    WHERE p.id = restaurants.manager_id
)
WHERE referer_id IS NULL AND manager_id IS NOT NULL;