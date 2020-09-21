const fs = require('fs-extra');
const path = require('path');

let Pwd = process.env.PWD
if (!Pwd) {
  Pwd = process.cwd()
}

class Config {
  constructor() {
    this.config = {}
    this.configPath = ''
    this.init()
  }
  init() {
    this.getConfigPath('.crarc')
    if (!this.configPath) { return null }

    this.config = require(this.configPath)
  }
  set(key, value) {
    this.config[key] = value
  }
  get(key) {
    return this.config[key]
  }
  getConfigPath(fileName) {
      if (!fileName) { return null }
      
      // 当前命令运行目录下的
      this.checkFileExistReturn(
        path.join(Pwd, `./${fileName}`)
      );
      
      // 全局默认路径
      this.checkFileExistReturn(
          path.join(process.env.HOME || process.env.HOMEPATH, fileName)
      );
      
      // 包中默认模版
      this.checkFileExistReturn(
        path.join(__dirname, `../${fileName}`)
      );  
  }
  checkFileExistReturn(path) {
      if (path && typeof path !== 'string') {
        this.configPath = path 
      }
      if (path && fs.existsSync(path)) {
        this.configPath = path
      }
      this.configPath = null
  }
  merge(config) {
    if (!config) return null;
    Object.assign(this.config, config)
  }
}

exports.Config = Config
exports.config = new Config()

