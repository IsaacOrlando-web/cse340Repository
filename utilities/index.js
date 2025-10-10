const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications(1)
    let accountType = "Guest"; // valor por defecto
    if (res && res.locals && res.locals.accountData) {
        accountType = res.locals.accountData.account_type || "Guest";
    }

    console.log("=== DEBUG getNav ===");
    console.log("res existe:", !!res);
    console.log("res.locals existe:", res?.locals);
    console.log("res.locals.accountData:", res?.locals?.accountData);
    console.log("accountType final:", accountType);
    console.log("=== FIN DEBUG ===");

    let list = "<ul>"
    list += '<li class="nav_item"><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += '<li class="nav_item">'
        list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
        list += "</li>"
    })
    if(accountType === 'Client'){
        list += '<li class="nav_item"><a href="/inv/favorites" title="Favorite Cars">Favorites</a></li>'
    }
    list += "</ul>"
    return list
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
    '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}


//This file will hold functions that are "utility" in nature, meaning that we will reuse them over and over, but they don't directly belong to the M-V-C structure

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data, accountType){
    console.log("Account Type:", accountType)
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        if(accountType === 'Client'){  
          grid += '<form class="addFavoritesForm" action="/inv/addFavorites" method="post">';
          grid += '<input type="hidden" name="classification_id" value="' + vehicle.classification_id + '">';
          grid += '<input type="hidden" name="inv_id" value="' + vehicle.inv_id + '">';
          grid += '<button type="submit" class="addVehicle" id="addfavoritesvehiclebtn">Add To Favorites</button>';
          grid += '</form>';
        }
        grid += '</li>'
    })  
        grid += '</ul>'
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.buildFavoritesGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => { 
          grid += '<li>'
          grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
          + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
          + 'details"><img src="' + vehicle.inv_thumbnail 
          +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
          +' on CSE Motors" /></a>'
          grid += '<div class="namePrice">'
          grid += '<hr />'
          grid += '<h2>'
          grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
          + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
          + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
          grid += '</h2>'
          grid += '<span>$' 
          + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
          grid += '</div>'
          grid += '<form class="addFavoritesForm" action="/inv/remove" method="post">';
          grid += '<input type="hidden" name="classification_id" value="' + vehicle.classification_id + '">';
          grid += '<input type="hidden" name="inv_id" value="' + vehicle.inv_id + '">';
          grid += '<button type="submit" class="removeVehicle" id="removefavoritesvehiclebtn">Remove From Favorites</button>';
          grid += '</form>';
        
        grid += '</li>'
    })  
        grid += '</ul>'
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.buildSingleVehicleDisplay = async (vehicle) => {
    let svd = '<section id="vehicle-display">'
    svd += `<h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>` // Heading principal
    svd += "<div>"
    svd += '<div class="imagePrice">' // Cambiado a div
    svd +=
        "<img src='" +
        vehicle.inv_image +
        "' alt='Image of " +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        " on cse motors' id='mainImage'>"
    svd += "</div>"
    svd += '<div class="vehicleDetail">' // Cambiado a div
    svd += "<h3> " + vehicle.inv_make + " " + vehicle.inv_model + " Details</h3>"
    svd += '<ul id="vehicle-details">'
    svd +=
        "<li><h4>Price: $" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</h4></li>"
    svd += "<li><h4>Description:</h4> " + vehicle.inv_description + "</li>"
    svd += "<li><h4>Color:</h4> " + vehicle.inv_color + "</li>"
    svd +=
        "<li><h4>Miles:</h4> " +
        new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
        "</li>"
    svd += "</ul>"
    svd += "</div>"
    svd += "</div>"
    svd += "</section>"
    return svd
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
      })
  } else {
    next()
  }
}
/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
* Middleware to check account type
**************************************** */
/* ************************
 * Middleware para verificar permisos de empleado/admin
 *************************/
/* ****************************************
* Middleware to check account type
**************************************** */
Util.checkAccountType = (req, res, next) => {
  if(!res.locals.accountData)
 {
    return res.redirect("/account/login")
    }
  if (res.locals.accountData.account_type == "Employee" ||
      res.locals.accountData.account_type == "Admin") 
    {
      next()
    } 
    else 
    {
      return res.redirect("/account/login")
    }
}


module.exports = Util