const { get } = require("http");
const pool = require("../database")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password, account_type) {
    console.log("account_type in model:", account_type);
    try {
        
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password, account_type])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check login credentials
 * ********************* */
async function checkLogin(account_email, account_password) {
    try {
        const sql = "SELECT account_id, account_firstname, account_type, account_password FROM account WHERE account_email = $1"
        const data = await pool.query(sql, [account_email])
    
    if (data.rowCount === 1) {
        const isPasswordValid = await bcrypt.compare(account_password, data.rows[0].account_password)
        if (isPasswordValid) {
            return data.rows[0] // Return user data without password
        }
    }
    return null // Return null if credentials are invalid
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

async function updateAccount (account_id, account_firstname, account_lastname, account_email){
    try {
        const result = await pool.query(
            "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *",
            [account_firstname, account_lastname, account_email, account_id]
        )
        return result.rows[0]
    } catch (error) {
        return error.message // Devuelve el mensaje de error
    }
}

async function getUserById(account_id) {
    try {
        const sql = "SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id= $1"
        const data = await pool.query(sql, [account_id])
        return data.rows[0]
    } catch (error) {
        return error.message
    }
}

async function updatePassword(hashedPassword, account_id) {
  try {
    const res = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *",
      [hashedPassword, account_id]
    )
    return res.rows[0]
  } catch (error) {
    throw new Error("Query failed.")
  }
}

async function addFavoriteCar(account_id, car_id){
    try {
        const res = await pool.query("INSERT INTO favorite (account_id, inv_id) VALUES ($1, $2) RETURNING *",[account_id, car_id])
        return res.rows[0]
    } catch (error) {
        return error.message
    }
}

module.exports = { registerAccount, checkExistingEmail, checkLogin, getAccountByEmail, updateAccount, getUserById, updatePassword, addFavoriteCar }