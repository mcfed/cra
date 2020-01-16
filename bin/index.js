#!/usr/bin/env node

var program = require('commander')
var fs = require('fs')
var path = require('path')

let package = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
package = JSON.parse(package)

program
  .version(package.version)
  .option('-c, --change-to-available-version', '安装可利用的create-react-app版本')
  .action(async function (commander) {
    if (commander.changeToAvailableVersion) {
      require('../install')
    } else {
      require('../create')
    }
  })
  .parse(process.argv)
