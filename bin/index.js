#!/usr/bin/env node

var program = require('commander')

const package = require('../package.json')

program
  .version(package.version)
  .option('-r, --render-project <moudleName> <templateDir> <newRenderProjectDir>', '渲染项目')
  .action(async function (commander) {
    if (commander.renderProject) {
      try {
        require('../src/renderTemplate')(commander.renderProject, commander.args[0], commander.args[1])
      } catch (error) {
        console.error(error.stack)
      }
    }
  })
  .parse(process.argv)
