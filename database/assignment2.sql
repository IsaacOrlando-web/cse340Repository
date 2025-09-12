-- SQL Step 5.1: Insert the following new record to the account table Note: The account_id and account_type fields should handle their own values and do not need to be part of this query.(Tony, Stark, tony@starkent.com, Iam1ronM@n)
INSERT INTO "account"(account_firstname, account_lastname, account_email, account_password)
	VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- SQL Step 5.2: Modify the Tony Stark record to change the account_type to "Admin".
UPDATE "account" SET account_type = 'Admin'
	WHERE account_id = 1;

-- SQL Step 5.3: Delete the Tony Stark record from the database.
DELETE FROM "account" WHERE account_firstname = 'Tony';

-- SQL step 5.4: Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query. Explore the PostgreSQL Replace function Do NOT retype the entire description as part of the query.. It needs to be part of an Update query as shown in the code examples of this SQL Reading.
SELECT REPLACE 
	('Do you have 6 kids and like to go offroading? The Hummer gives you the small interiors with an engine to get you out of any muddy or rocky situation.', 'small interiors', 'a huge interior');


-- SQL step 5.5: Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category.
SELECT inv_make, inv_model, classification_name FROM "inventory" 
	JOIN classification ON classification.classification_id = "inventory".classification_id;

-- SQL step 5.6: Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query. 
SELECT 
    inv_image, 
    REPLACE(inv_image, '/images/', '/images/vehicles/') as new_inv_image,
    inv_thumbnail,
    REPLACE(inv_thumbnail, '/images/', '/images/vehicles/') as new_inv_thumbnail
FROM inventory;
