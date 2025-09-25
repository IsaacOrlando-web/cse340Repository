// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", 
utilities.handleErrors(invController.buildDetail))

router.get(
    "/broken",
    utilities.handleErrors(invController.thowError)
)

module.exports = router;