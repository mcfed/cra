const Mustache = require('mustache');
const configObject = require('../config');

module.exports = function render(fileData, config) {
    configObject.merge(config)
    
    return Mustache.render(fileData, configObject.config, {}, ['{@', '@}'])
}