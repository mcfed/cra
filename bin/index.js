#!/usr/bin/env node

var program = require('commander')
var craRender = require('@mcfed/cra-render')

const package = require('../package.json')

program
  .version(package.version)
  .option('-r, --render-project <moudleName> <templateDir> <newRenderProjectDir>', '渲染项目')
  .action(async function (commander) {
    if (commander.renderProject) {
      try {
        craRender.renderTemplate({
          namespace: commander.renderProject || '',
          templateDir: commander.templateDir || '',
          newRenderProjectDir: commander.newRenderProjectDir || ''
        })
      } catch (error) {
        console.error(error.stack)
      }
    }
  })
  .parse(process.argv)
