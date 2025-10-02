// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const invCont = require("../controllers/invController")

// Route to build inventory by classification view

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/", utilities.checkLogin, utilities.handleErrors(invCont.buildManagementView))

router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

 //Process the login request
router.post(
    "/login",
    regValidate.loginRules(),
    //regValidate.checkLoginData(),
    utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;