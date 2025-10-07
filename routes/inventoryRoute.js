// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invChecks = require("../utilities/inventory-validation")

// Rutas PÚBLICAS (sin verificación de tipo de cuenta)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:id", utilities.handleErrors(invController.buildDetail))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Rutas ADMINISTRATIVAS (requieren Employee o Admin)
router.get(
  "/",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.buildManagementView)
)

router.get(
  "/newClassification",
  utilities.checkAccountType, // ← YA TIENE (correcto)
  utilities.handleErrors(invController.newClassificationView)
)

router.post(
  "/addClassification",
  utilities.checkAccountType, // ← YA TIENE (correcto)
  invChecks.classificationRule(),
  invChecks.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

router.get(
  "/newVehicle",
  utilities.checkAccountType, // ← DESCOMENTAR y AGREGAR
  utilities.handleErrors(invController.newInventoryView)
)

router.post(
  "/addInventory",
  utilities.checkAccountType, // ← DESCOMENTAR y AGREGAR
  invChecks.newInventoryRules(),
  invChecks.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Eliminar duplicado (tienes dos router.post para "/addInventory")
// router.post(
//   "/addInventory",
//   utilities.checkAccountType,
//   invChecks.newInventoryRules(),
//   invChecks.checkInventoryData,
//   utilities.handleErrors(invController.addInventory)
// )

router.get(
  "/edit/:inv_id",
  utilities.checkAccountType, // ← AGREGAR aquí
  utilities.handleErrors(invController.editInventory)
)

router.post(
  "/update",
  utilities.checkAccountType, // ← YA TIENE (correcto)
  invChecks.newInventoryRules(),
  invChecks.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/delete/:id",
  utilities.checkAccountType, // ← AGREGAR aquí
  utilities.handleErrors(invController.buildDeleteConfirmation)
)

router.post(
  "/delete",
  utilities.checkAccountType, // ← YA TIENE (correcto)
  utilities.handleErrors(invController.deleteItem)
)

// Ruta de prueba de errores (puede mantenerse pública o protegida según necesites)
router.get(
  "/broken",
  utilities.handleErrors(invController.thowError)
)

module.exports = router;