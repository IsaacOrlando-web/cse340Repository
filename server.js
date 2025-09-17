/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts") //we tell the application to require express-ejs-layouts, so it can be used.
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")


/* ***********************
 * View Engine and Templates
 *************************/
app.use(expressLayouts) //This two lines tells the application to use the express-ejs-layouts package, which has been stored into a "expressLayouts" variable.
app.set("layout", "./layouts/layout") //This line says that when the express ejs layout goes looking for the basic template for a view, it will find it in a layouts folder, and the template will be named layout.
app.set("view engine", "ejs") //we declare that ejs will be the view engine for our application



//Index route
app.get('', baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)


/* ***********************
 * Routes
 *************************/
app.use(static) // meaning that the application itself will use this resource.

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
