const fs = require('fs-extra');
const path = require('path');
const configObject = require('../config');
const render = require('./render');

const config = configObject.config;

module.exports = function main() {
    try {
        if (!config.namespace) {
            config.set('namespace', 'demoTemplate')
        }

        if (!config.templateDir) {
            config.set('templateDir', path.resolve(process.cwd(), 'template'))
        }

        if (!config.newRenderProjectDir) {
            config.set('newRenderProjectDir', path.resolve(process.cwd(), `packages/${config.namespace}`)) 
        }

        if (!fs.existsSync(config.newRenderProjectDir)) {
            fs.mkdirpSync(config.newRenderProjectDir)
        }
        fs.copySync(config.get('templateDir'), config.get('newRenderProjectDir'))

        // 渲染
        renderDirs(config.get('newRenderProjectDir'))
    } catch (err) {
        throw new Error('渲染模版错误：', err.message)
    }
}

const renderDirs = (dir) => {
    const result = fs.readdirSync(dir)
    for (const name of result) {
      var filePath = path.resolve(dir, name)
      if (/node_modules|\.git|\.jpg$|\.png$/.test(filePath)) {
        continue
      }
      var stats = fs.statSync(filePath)
      var isFile = stats.isFile() // 是文件
      var isDir = stats.isDirectory() // 是文件夹
      if (isFile) {
        fs.writeFileSync(
            render(
                fs.readFileSync(filePath, 'utf-8')))
      }
      if (isDir) {
        renderDirs(filePath, tpl)
      }
    }
}