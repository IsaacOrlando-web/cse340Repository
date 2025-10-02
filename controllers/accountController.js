const { title } = require('process')
const accountModel = require('../models/account-model')
const utilities = require('../utilities')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
      })
    }

    console.log("=== LOGIN DEBUG ===")
    console.log("Input password:", `"${account_password}"`)
    console.log("Stored hash:", accountData.account_password)
    
    // Verificaciones de debug
    const isValidBcrypt = /^\$2[aby]\$[0-9]{2}\$/.test(accountData.account_password)
    console.log("Is valid bcrypt format?", isValidBcrypt)
    
    const testHash = await bcrypt.hash(account_password, 10)
    console.log("New hash from same password:", testHash)
    console.log("Hashes match?", testHash === accountData.account_password)
    
    const testCompare = await bcrypt.compare(account_password, testHash)
    console.log("Compare with new hash:", testCompare)
    
    // Comparación real con la base de datos
    const dbCompare = await bcrypt.compare(account_password, accountData.account_password)
    console.log("Compare with DB hash:", dbCompare)
    
    if (dbCompare) {
      console.log("✅ Login SUCCESS")
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: 3600 * 1000 
      })
      
      const cookieOptions = {
        httpOnly: true, 
        maxAge: 3600 * 1000
      }
      
      if (process.env.NODE_ENV !== 'development') {
        cookieOptions.secure = true
      }
      
      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account")
    } else {
      console.log("❌ Login FAILED - hashes don't match")
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
      })
    }
    
  } catch (error) {
    console.error("🚨 Error:", error.message)
    req.flash("notice", "An error occurred during login. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email: req.body.account_email || '',
    })
  }
}
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin }