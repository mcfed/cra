const customizeCra = require("customize-cra")
const path = require('path')
const paths = require('react-scripts/config/paths')

const {
    disableChunk,
    adjustStyleLoaders,
} = customizeCra

customizeCra.addDefaultConfig = () => config => {
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

module.exports = customizeCra
