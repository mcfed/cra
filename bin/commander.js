#!/usr/bin/env node

const program = require('commander')
const package = require('../package.json')
const configObject = require('../src/config')
const craRender = require('@mcfed/cra-render')
const craSsr = require('@mcfed/cra-ssr')

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
      craRender.renderTemplate({
        namespace: commander.renderProject || '',
        templateDir: commander.templateDir || '',
        newRenderProjectDir: commander.newRenderProjectDir || ''
      })
  })

program
  .command('install [options]')
  .description('创建模版项目')
  .option('-n --project-name <projectName>', '项目名称', _=>_, 'projectname')
  .option('-t --template-path <templatePath>', '渲染项目名称', _=>_, 'cra-template-crat')
  .action((commander) => {
    configObject.merge(commander)
    require('../src/create-project/create')
  })

program
  .command('ssr [options]')
  .description('启动ssr server')
  .option('-p --package-name <packageName>', '目标服务包名')
  .option('-b --build-path <buildPath>', '目标服务包构建路径', 'dist')
  .option('-p --index-path <indexPath>', '目标服务包名构建目录文件名称', 'index.html')
  .action((commander) => {
    craSsr.config.merge(commander)
    craSsr.startServer()
  })

program.parse(process.argv);


