const fs = require('fs')
const path = require('path')

const HomePath = process.env.HOME
const Pwd = process.env.PWD

class File {
    constructor() {
        this.dir = ``
    }
    init(filePath, data=[]) {
        if (!this.exist(filePath)) {
            this.set(filePath, data, { needStringify: true })
        }
    }
    exist(path) {
        return fs.existsSync(this.getPath(path))
    }
    existDir(dir) {
         if (!fs.existsSync(dir)) {
            return false
         }
         if (!fs.lstatSync(dir).isDirectory()) {
            return false
         }
         return true
    }
    getPath(filePath, dir) {
        dir = dir || this.dir
        if (dir) {
            return path.join(dir, filePath)
        }
        return filePath
    }
    getJson(filePath, dir) {
        const filePathTmp = this.getPath(filePath, dir)
        if (this.exist(filePathTmp)) {
            return require(filePathTmp)
        }
        return null
    }
    get(filePath, { needParse, dir } = {}) {
        let res = fs.readFileSync(this.getPath(filePath, dir), 'utf8')
        if (needParse) { res = JSON.parse(res) }
        return res
    }
    set(filePath, data, { needStringify, dir } = {}) {
        if (needStringify) { data = JSON.stringify(data, null, 2) }
        fs.writeFileSync(this.getPath(filePath, dir), data, 'utf8')
    }
    createDir(dir) {
        const tmpPath = dir || this.dir
        if (!this.existDir(tmpPath)) {
            fs.mkdirSync(tmpPath)
        }
    }
    remove(path) {
        if (this.exist(path)) {
            fs.unlinkSync(path)
        }
    }
    removeDir(dir=this.dir) {
        if (this.existDir(dir)) {
            fs.rmdirSync(dir, { recursive: true })
        }
    }
    getDirs(dir) {
        return fs.readdirSync(dir || this.dir)
    }
    getFilesByDir(dir, filesList = []) {
        const files = this.getDirs(dir);
        files.forEach((item) => {
            const fullPath = this.getPath(item, dir);
            if (this.existDir(fullPath)) {      
                this.getFilesByDir(this.getPath(item, dir), filesList);  //递归读取文件
            } else {                
                filesList.push(fullPath);                     
            }        
        });
        return filesList;
    }
}

module.exports = File