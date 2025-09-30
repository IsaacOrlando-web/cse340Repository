const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications(1)
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

module.exports = Util

//This file will hold functions that are "utility" in nature, meaning that we will reuse them over and over, but they don't directly belong to the M-V-C structure

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
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