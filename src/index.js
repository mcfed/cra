 const cm = require("@mcfed/cra-custom")
 const craRender = require('@mcfed/cra-render')

 cm.renderTemplate = craRender.renderTemplate
 cm.renderFile = craRender.render
 cm.render = craRender.render
 
 module.exports = cm
