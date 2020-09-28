#!/usr/bin/env node

const program = require('commander')
const package = require('../package.json')
const configObject = require('../src/config')
const renderTemplate = require('../src/render-template')

program
  .version(package.version)
  .description('mcfcra 命令简介')
  .action(() => {
  })
  .on('--help', () => {
    console.log('');
    console.log('');
    console.log('');
  })

program
  .command('render [options]')
  .description('渲染项目')
  .option('-r --render-project <moudleName>', '渲染项目名称')
  .option('-t --template-dir <templateDir>', '模版路径')
  .option('-n --new-render-project-dir <newRenderProjectDir>', '新生成的模版路径')  
  .action((commander) => {
      configObject.merge({
        namespace: commander.renderProject || '',
        templateDir: commander.templateDir || '',
        newRenderProjectDir: commander.newRenderProjectDir || ''
      })
      renderTemplate()
  })

program
  .command('install [options]')
  .description('创建模版项目')
  .option('-n --project-name <projectName>', '项目名称', _=>_, 'projectname')
  .option('-t --template-path <templatePath>', '渲染项目名称', _=>_, 'cra-template-crat')
  .action(() => {
    configObject.merge({
      projectName: commander.projectName,
      templatePath: commander.templatePath
    })
    require('../src/create-project/create')
  })

program
  .command('ssr [options]')
  .description('启动ssr server')
  .action(() => {
    require('../src/ssr')
  })

program.parse(process.argv);


