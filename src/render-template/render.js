const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');
const configObject = require('../config');

const config = configObject.config.config;
let Pwd = process.env.PWD
if (!Pwd) {
  Pwd = process.cwd()
}
module.exports = function render(fileData, configData) {
    return Mustache.render(fileData, configData || config, {}, ['{@', '@}'])
}