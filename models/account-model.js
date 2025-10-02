const pool = require("../database")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
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

module.exports = { registerAccount, checkExistingEmail, checkLogin, getAccountByEmail }