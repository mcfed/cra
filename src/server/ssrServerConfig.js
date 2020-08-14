class SsrServerConfig {
    constructor() {
        this.getSsrServerConfig()
    }
    getSsrServerConfig() {
        const env = process.env
        Object.keys(env).map(key => {
          if (key.indexOf('ssrServerConfig') !== -1) {
            const defaultPrefix = 'npm_package_ssrServerConfig_'
            const ssrKey = key.replace(defaultPrefix, '')
            const value = env[key]
            if (ssrKey.indexOf('_') !== -1) {
              const ssrKeyArr = ssrKey.split('_')
              const index = ssrKeyArr[1]
              if (!this[ssrKeyArr[0]]) { this[ssrKeyArr[0]] = [] }
              this[ssrKeyArr[0]][index] = value
            } else {
              this[ssrKey] = value
            }
          }
        })
    }
}

module.exports = new SsrServerConfig()