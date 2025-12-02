-- Cleanup all test data in correct order (foreign key dependencies)

-- 1. Delete dependent tables first
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM offers;
DELETE FROM reviews;
DELETE FROM matches;
DELETE FROM transactions;
DELETE FROM refund_requests;
DELETE FROM notifications;
DELETE FROM lead_purchases;

-- 2. Delete main tables
DELETE FROM projects;
DELETE FROM contractors;

-- 3. Delete user data last
DELETE FROM user_roles;
DELETE FROM profiles;