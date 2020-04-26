const shell = require('shelljs')

class Shell {
    static exec(cmd, errMessage='FAIL') {
        const result = shell.exec(cmd)
        if (result.code !== 0) {
            throw new Error(`${errMessage} \n${JSON.stringify(result, null, 2)} \n`)
        }
        return result
    }
    static cmdExist(cmd) {
        if (!shell.which(cmd)) {
           throw new Error(`${cmd} is not found`)
        }
    }
    static goto(path) {
        return this.exec(`cd ${path}`)
    }
}
module.exports = Shell