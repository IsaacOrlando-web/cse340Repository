/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const flash = require("connect-flash")
const messages = require("express-messages")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountController = require("./controllers/accountController")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const router = require("./routes/static")
const bodyParser = require("body-parser")


/* ***********************
 * View Engine and Templates
 *************************/
app.use(expressLayouts) //This two lines tells the application to use the express-ejs-layouts package, which has been stored into a "expressLayouts" variable.
app.set("layout", "./layouts/layout") //This line says that when the express ejs layout goes looking for the basic template for a view, it will find it in a layouts folder, and the template will be named layout.
app.set("view engine", "ejs") //we declare that ejs will be the view engine for our application

/* ***********************
 * Middleware
 *************************/
// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}))

// Flash middleware
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = messages(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//Index route
app.get('', baseController.buildHome)
// Inventory routes



/* ***********************
 * Routes
 *************************/
app.use(static) // meaning that the application itself will use this resource.
// File Not Found Route - must be last route in list
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})