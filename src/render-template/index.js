const fs = require('fs-extra');
const path = require('path');
const configObject = require('../config');
const render = require('./render');

module.exports = function renderTemplate(config) {
    try {
        configObject.merge(config)

        configObject.defaultValue({
            namespace: 'demoTemplate',
            templateDir: path.resolve(configObject.get('pwd'), 'template'),
            newRenderProjectDir: path.resolve(configObject.get('pwd'), `packages/${configObject.namespace}`)
        })

        if (!fs.existsSync(configObject.newRenderProjectDir)) {
            fs.mkdirpSync(configObject.newRenderProjectDir)
        }
        fs.copySync(configObject.get('templateDir'), configObject.get('newRenderProjectDir'))

        // 渲染
        renderDirs(configObject.get('newRenderProjectDir'))
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
        renderDirs(filePath)
      }
    }
}