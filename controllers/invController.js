const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { title } = require("process")
require("dotenv").config()

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    
    console.log(data)
    const accountType = res.locals.accountData?.account_type || "valor-por-defecto-contextual";
    const accountId = res.locals.accountData?.account_id || "NoId";
    console.log("Account Type: ", accountType)
    console.log("Account ID: ", accountId)
    const grid = await utilities.buildClassificationGrid(data, accountType)
    //
    let nav = await utilities.getNav(req, res)
    
    if(data.length === 0){
        req.flash("notice", "Sorry, no vehicles could be found.")
        res.redirect("/inv/")
        return
    } else {
      const className = data[0].classification_name
      res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
    }
}

invCont.buildFavoritesView = async function (req, res, next) {
  let account_id = res.locals.accountData.account_id
  let data = await invModel.getFavoriteCarsByAccountId(account_id)
  console.log("Favorite Cars By the User: ", data)
  let grid = await utilities.buildFavoritesGrid(data)
  let nav = await utilities.getNav(req, res)
  res.render("./inventory/favorites",{
    nav,
    title: "Favorites",
    grid
  })
}

invCont.buildDetail = async function (req, res, next) {
  const invId = req.params.id
  let vehicle = await invModel.getInventoryById(invId)
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
  let nav = await utilities.getNav(req, res)
  const vehicleTitle =
    vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    message: null,
    htmlData,
  })
}

invCont.throwError = async function (req, res) {
    throw new Error("I am an intentional error")
}


/* ***************************
 * Build new classification view
 * Assignment 4, Task 2
 * ************************** */
invCont.newClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}


/* ***************************
 * Process new classification insert
 * Assignment 4, Task 2
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { classification_name } = req.body
  const insertResult = await invModel.addClassification(classification_name)

  if (insertResult) {
    let nav = await utilities.getNav(req, res)
    req.flash("message success", `The ${insertResult.classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

invCont.removeFavoriteCar = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { inv_id } = req.body
  const accountId = res.locals.accountData.account_id

  const deleteCar = await invModel.removeFavoriteCar(accountId, inv_id)
  if(deleteCar){
    req.flash("notice", "Car removed from favorites")
    return res.redirect("/inv/favorites")
  } else {
    req.flash("notice", "Car not removed from favorites")
    return res.redirect("/inv/favorites")
  }
}

/* ***************************
 * Build new inventory view
 * Assignment 4, Task 3
 * ************************** */
invCont.newInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect: classificationSelect,
    errors: null,
  })
}

/* ***************************
 * Process new inventory item insert
 * Assignment 4, Task 3
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const {
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
  } = req.body
  const insertResult = await invModel.addInventory(
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
  )

  if (insertResult) {
    const itemName = insertResult.inv_make + " " + insertResult.inv_model
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message success", `The ${itemName} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect: classificationSelect,
      errors: null,
    })
  }
}

/* *************************************
 *  Return Inventory by Classification As JSON
 *  Unit 5, Select Inv Item activity
 * *********************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit item view
 *  Unit 5, Update Step 1 Activity
 * ************************** */
invCont.editInvItemView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(req, res)
  const invData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(invData.classification_id)
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    classification_id: invData.classification_id
  })
}

//delete confirmation view is being built and delivered.
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(req, res)
  const invData = await invModel.getInventoryById(inv_id)
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Edit " + itemName,
    nav,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price
  })
}

/* ***************************
 *  Update Vehicle Data
 *  Unit 5, Update Step 2 Activity
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const {
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
  } = req.body

  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("message success", itemName+' was successfully updated.')
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 *  Unit 5, Delete Activity
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(req, res)
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Item
 *  Unit 5, Delete Activity
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id  = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("message success", 'The deletion was successful.')
    res.redirect('/inv/')
  } else {
    req.flash("message warning", 'Sorry, the delete failed.')
    res.redirect("/inv/delete/inv_id")
  }
}

/* ***************************
 * The delete is being carried out
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const {
    inv_id
    //inv_make,
    //inv_model,
    //inv_description,
    //inv_image,
    //inv_thumbnail,
    //inv_price,
    //inv_year,
    //inv_miles,
    //inv_color,
    //classification_id
  } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash( itemName+' was successfully Deleted.')
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("message warning", "Sorry, the Delte failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build vehicle management view
 *  Assignment 4, Task 1
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)
  const classificationSelect = await utilities.buildClassificationList()
  
  console.log("=== DEBUG RENDER ===")
  console.log("View path:", "inventory/management")
  console.log("classificationSelect exists:", !!classificationSelect)
  console.log("classificationSelect length:", classificationSelect.length)
  console.log("Current directory:", __dirname)

  try {
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect,
    })
    console.log("✅ Render called successfully")
  } catch (error) {
    console.error("❌ Render error:", error.message)
    throw error
  }
}


/* ***************************
 * EDIT INVENTORY
 * ************************** */
invCont.editInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav(req, res)
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav(req, res)

  console.log("Full Body:", req.body)
  console.log("inv_id from body:", req.body.inv_id)

  const {
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
    classification_id,
  } = req.body

  if (!inv_id) {
    console.error("ERROR: inv_id is missing from request body!")
    req.flash("notice", "Error: Inventory ID is missing.")
    return res.redirect("/inv/")
  }

  console.log("Data From Body - inv_id:", inv_id)
  console.log("Other data:", { inv_make, inv_model, inv_description })
  
  const updateResult = await invModel.updateInventory(//This function is not working, and the result is undefined
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
  )
  console.log("Update result: ", updateResult)

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

invCont.addFavoriteCar = async function(req, res, next) {
  const {
    inv_id,
    classification_id
  } = req.body
  const accountId = res.locals.accountData.account_id;
  console.log("car ID: ", inv_id, "/User ID: ", res.locals.accountData.account_id, "/Classification ID: ", classification_id)
  const addFavorite = await accountModel.addFavoriteCar(accountId ,inv_id);
  console.log("was added succesfully: ", addFavorite);

  if(addFavorite){
    req.flash("notice", "Car added to favorites")
    return res.redirect(`/inv/type/${classification_id}`)
  } else {
    req.flash("notice", "Car not added to favorites")
    return res.redirect(`/inv/type/${classification_id}`)
  }
}

module.exports = invCont