const { query } = require("express-validator")
const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getAccounts(){
  return await pool.query("SELECT * FROM public.accounts ORDER BY account_id")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECt * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error(error)
  }
}

/* ***************************
 *  Insert new classification
 *  Assignment 4, Task 2
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function getFavoriteCarsByAccountId(account_id){
  try {
    const data = await pool.query("SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail, i.classification_id, f.favorite_date FROM favorite f INNER JOIN inventory i ON f.inv_id = i.inv_id WHERE f.account_id = $1 ORDER BY f.favorite_date DESC;", [account_id])
    return data.rows
  } catch(error) {
    console.error("model error: " + error)
  }
}

async function removeFavoriteCar(account_id, inv_id){
  try{
    const data = await pool.query("DELETE FROM favorite WHERE account_id = $1 AND inv_id = $2;", [account_id, inv_id])
    return data
  } catch(error){
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Insert new vehicle
 *  Assignment 4, Task 3
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

//the function will carry out a deletion of the inventory item.
async function deleteInventory(inv_id) {
    try {
        const data = await pool.query('DELETE FROM inventory WHERE inv_id = $1', [inv_id]);
        return data;
    } catch (error) {
        console.error("Delte error: " + error);
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
      console.log("Ejectudanto el query: ", sql)
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getAccounts, getInventoryById, addClassification, addInventory, deleteInventory, updateInventory, getFavoriteCarsByAccountId, removeFavoriteCar };