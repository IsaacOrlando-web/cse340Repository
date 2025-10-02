// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invChecks = require("../utilities/inventory-validation")

// Route to build inventory by classification view


router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", utilities.handleErrors(invController.buildDetail))
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventory))
router.post("/update/", invController.updateInventory)

router.get("/delete/:id", 
utilities.handleErrors(invController.buildDeleteConfirmation))

router.get(
    "/broken",
    utilities.handleErrors(invController.thowError)
)

router.get(
  "/",
  //utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagementView)
)

router.get(
  "/newClassification",
  //utilities.checkAccountType,
  utilities.handleErrors(invController.newClassificationView)
)


router.post(
  "/addClassification",
  //utilities.checkAccountType,
  invChecks.classificationRule(),
  invChecks.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

router.get(
  "/newVehicle",
  //utilities.checkAccountType,
  utilities.handleErrors(invController.newInventoryView)
)


router.post(
  "/addInventory",
  //utilities.checkAccountType,
  invChecks.newInventoryRules(),
  invChecks.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.post(
  "/addInventory",
  //utilities.checkAccountType,
  invChecks.newInventoryRules(),
  invChecks.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.post(
  "/delete",
  //utilities.checkAccountType,
  //invChecks.newInventoryRules(),
  //invChecks.checkInventoryData,
  utilities.handleErrors(invController.deleteItem)
)

router.post(
  "/update",
  //utilities.checkAccountType,
  invChecks.newInventoryRules(),
  invChecks.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router;