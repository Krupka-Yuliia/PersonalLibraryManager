-- Change user role to ADMIN
-- Replace user_id with the actual user ID you want to change

UPDATE `user` 
SET `role` = 'ADMIN' 
WHERE `id` = 2;

-- Verify the change
SELECT `id`, `name`, `email`, `role` 
FROM `user` 
WHERE `id` = 2;

