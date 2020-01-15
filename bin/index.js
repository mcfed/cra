#!/usr/bin/env node

var program = require('commander')
var fs = require('fs')
var path = require('path')

let package = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
package = JSON.parse(package)

program
  .version(package.version)
  .action(function (commander) {
    require('../create')
  })
  .parse(process.argv)
