const customizeCra = require("customize-cra")
const path = require('path')
const paths = require('react-scripts/config/paths')

const {
    disableChunk,
    adjustStyleLoaders,
    addWebpackAlias,
} = customizeCra

const prodDefaultConfig = () => config => {
    const modes = {
        cjs: 'cjs',
        umd: 'umd'
    }
    const isProdMode = process.env.NODE_ENV === 'production'
    if (!isProdMode) { return config }

    let mode = process.env.MODE || process.env.mode || process.env.Mode
    if (mode) {
        mode = modes[mode.toLowerCase()]
    } else {
        mode = process.argv.find(arg => arg.indexOf(modes.cjs) !== -1 || arg.indexOf(modes.umd) !== -1)
    }
    
    if (!mode) { 
        return config
    }
    mode = mode.replace(/^-*/, '')
    
    if (!config.output) {
        config.output = {};
    }
    const outputDir = `dist/${mode}`
    config.output.filename = 'index.js'
    config.output.libraryTarget = mode === modes.cjs ? 'commonjs2' : modes.umd
    paths.appBuild = path.join(path.dirname(paths.appBuild), outputDir)
    config.output.path = path.join(path.dirname(config.output.path), outputDir)
    config.plugins = []
    adjustStyleLoaders((loader) => {
        loader.use = loader.use.filter(it => it.loader.indexOf('mini-css-extract-plugin') === -1)
    })(config)
    disableChunk()(config)
    
    return config
}

customizeCra.defaultConfig = () => config => {
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) {
      return prodDefaultConfig()(config)
    }
    const app = path.join(paths.appPath, 'app.js')
    const appIndex = path.join(paths.appPath, 'index.js')
    
    // 加别名
    addWebpackAlias({
      'react-intl': path.join(paths.appNodeModules, 'react-intl'),
      'mcf-module': path.join(paths.appNodeModules, 'mcf-module')
    })(config)
  
    // 增加入口文件
    config.entry.push(appIndex)
  
    // 修改babel-loader的include
    if (!config.module) {
      config.module = {}
    }
    if (!config.module.rules || !config.module.rules.length) {
      config.module.rules = []
    }
    for (const item of (config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf || [])) {
      if (item.loader && 
          item.loader.indexOf('babel-loader') !== -1 && 
          item.options &&
          item.options.customize &&
          item.options.customize.indexOf('babel-preset-react-app') !== -1
        ) {
          if (!item.include) {
            item.include = []
          }
          if (!Array.isArray(item.include)) {
            item.include = [item.include]
          }
          item.include.push(app)
          item.include.push(appIndex)
      }
    }
    
    return config
}

module.exports = customizeCra
