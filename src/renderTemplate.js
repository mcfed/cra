const fs = require('fs-extra');
const path = require('path');

module.exports = function main(moudleName, templateDir, newRenderProjectDir) {
    try {
        if (!moudleName) {
            moudleName = 'demoTemplate'
        }

        if (!templateDir) {
            templateDir = path.resolve(process.cwd(), 'template')
        }

        if (!newRenderProjectDir) {
            newRenderProjectDir = path.resolve(process.cwd(), `packages/${moudleName}`)
        }

        if (!fs.existsSync(newRenderProjectDir)) {
            fs.mkdirpSync(newRenderProjectDir)
        }
        fs.copySync(templateDir, newRenderProjectDir)

        // 渲染
        require('./create-project/renderProject')(newRenderProjectDir, moudleName)
    } catch (err) {
        throw new Error('渲染模版错误：', err.message)
    }
}