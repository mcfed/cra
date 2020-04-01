const inquirer = require('inquirer');
const shell = require('shelljs');
const fs = require('fs')
const path = require('path')
const moment = require('moment')

const config = {
    gitlab: 'http://git.mchz.com.cn/'
}
const HomePath = process.env.HOME
const Pwd = process.env.PWD
let projectPath = null

// GIT 
class Git {
    check() {
        Shell.cmdExist('git')
    }
    getTmpDir(dir) {
        return dir ? dir + '/' + 'tmp' : ''
    }
    clone(projectUrl, dir) {
        dir = this.getTmpDir(dir)
        Shell.exec(`git clone ${projectUrl} ${dir}`, 'Project Clone failed')
        return dir
    }
    remove(dir) {
        Shell.exec(`rm -rf ${dir}`, 'Project Delete failed')
    }
    getFileCommitHistorys(filePath, dir) {
        const errorMessage = 'fetch file commit history failed'
        let cmd = ` git log -10 --pretty=format:"%cd -- %an -- %H" ${filePath}`
        if (dir) { cmd = `cd ${dir} && ` + cmd }

        return Shell.exec(cmd, errorMessage)
    }
    diff(commitId, commitIdDiff, { filePath, projectPath, customCmd } = {}) {
        const errorMessage = 'diff commit fail'
        let cmd = `git diff ${commitIdDiff} ${commitId}`
        if (projectPath) { cmd = `cd ${projectPath} && ` + cmd }
        if (filePath) { cmd += ` -- ${filePath}` }
        if (customCmd) { cmd += ` && ${customCmd} ` }
        return Shell.exec(cmd, errorMessage)
    }
}

// Project
class Project {
    constructor(name, git) {
        if (name.indexOf(config.gitlab) !== -1) {
            name = formatName(name)
        }
        this.name = name
        this.git = git
    }
    getUrl() {
        return `${config.gitlab}${this.name}`
    }
    gitGitlabUrl() {
        return `${config.gitlab}${this.name}.git`
    }
    gitWikiGitlabUrl() {
        return `${config.gitlab}${this.name}.wiki.git`
    }
    formatName(name) {
        return name.replace(config.gitlab, '')
    }
}

// Inquirer
class Inquirer {
    constructor() {
        this.inquirer = inquirer
        this.questions = []
    }
    prompt() {
        return inquirer.createPromptModule()(this.questions)
    }
    addQuestion(item) {
        this.questions.push(item)
    }
    addQuestions(list) {
        this.questions = this.questions.concat(list)
    }
    clear() {
        this.questions = []
    }
}

class File {
    constructor() {
        this.dir = `${HomePath}/.gitlabWikiProjectConfig`
        this.createDir()
    }
    init(filePath) {
        if (!this.exist(filePath)) {
            this.set(filePath, [], { needStringify: true })
        }
    }
    exist(path) {
        return fs.existsSync(this.getPath(path))
    }
    existDir(dir) {
        return fs.existsSync(dir)
    }
    getPath(filePath, dir) {
        return path.join(dir || this.dir, filePath)
    }
    getJson(filePath) {
        const filePathTmp = this.getPath(filePath)
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
    removeDir(dir) {
        fs.rmdirSync(dir || this.dir, { recursive: true })
    }
    getDirs(dir) {
        return fs.readdirSync(dir || this.dir)
    }
}

class Utils {
    static getProjectName(projectname) {
        if (typeof projectname === 'string') {
            return projectname
        } else if (typeof projectname === 'object') {
            if (typeof projectname.value === 'string') {
                return projectname.value
            }
        }
        return ''
    }
    static removeDirsFileType(dirs, type='.md') {
        return dirs.map(name => name.replace(type, ''))
    }
}

class Shell {
    static exec(cmd, errMessage='FAIL') {
        const result = shell.exec(cmd)
        if (result.code !== 0) {
            throw new Error(errMessage)
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

    static getCommitIds(str) {
        return str.split('\n').map(e => {
            const arr = e.split('--')
            return { 
                updateTime: moment(new Date(arr[0].trim())).format('YYYY-MM-DD LTS'),
                user: arr[1].trim(),
                commitId: arr[2].trim()
            }
        }).filter(e => e)
    }
}


async function main(git, inquirer, fileServer, Project) {
    const tmpProjectPath = './.projects'
    projectPath = git.getTmpDir(tmpProjectPath)
    try {

        const result = {}
        const projectFileName = 'projectlist.json'
        const diffName = 'diff.md'
    
        // 验证存在 git
        git.check()
        fileServer.init(projectFileName)
    
        // 获取项目名称列表
        let list = fileServer.get(projectFileName, { needParse: true }) || []
    
        // 获取项目名称《选择+输入，增加持久化》
        inquirer.addQuestions([{
                type: "input",
                name: "projectName",
                message: "请输入你的gitLab项目名称/地址？",
                when: function () {
                    return !list.length
                }
            }, {
                type: "list",
                name: "projectName",
                message: "请选择你的gitLab项目名称/地址？",
                choices: function () {
                    return [{
                        name: '无',
                        value: null
                    }].concat(list)
                },
                when: function () {
                    return !result.projectName && list.length
                }
            }
        ])
        let res = await inquirer.prompt()
        if (res.projectName === null) {
            inquirer.clear()
            inquirer.addQuestion({
                type: "input",
                name: "projectName",
                message: "请输入你的gitLab项目名称/地址？"
            })
            res = await inquirer.prompt()
        }
        result.projectName = Utils.getProjectName(res.projectName)
        if (!result.projectName) {
            console.error(`请选择/输入正确的项目名称/地址`)
            return;
        }
        // 验证存在 项目
        const projectServer = new Project(result.projectName, git)
    
        // 项目准备（项目拉取）
        projectPath = git.clone(projectServer.gitWikiGitlabUrl(), tmpProjectPath)

        // 记录配置
        if (!list.find(e => e.value === result.projectName)) {
            list.push({ name: result.projectName, value: result.projectName })
            fileServer.set(projectFileName, list, { needStringify: true })
        }
    
        // 获取文档名称列表《之后单选》
        const dirs = fileServer.getDirs(projectPath)
        const markdownDirs = dirs.filter(dir => /\.md$/.test(dir))
        const mdNams = Utils.removeDirsFileType(markdownDirs)
        if (!mdNams.length) {
            throw new Error('WIKI文档不存在')
        }
        inquirer.clear()
        inquirer.addQuestion({
            type: "list",
            name: "fileName",
            message: "请选择你的WIKI文档名称？",
            choices: mdNams,
            when: function () {
                return !!mdNams.length
            }
        })
        res = await inquirer.prompt()
        if (res.fileName) {
            result.fileName = res.fileName
        }
    
        // 获取选择文档提交列表《之后选择》
        const filePath = path.join(Pwd, projectPath, `${result.fileName}.md`)
        let { stdout: commitHistorys } = git.getFileCommitHistorys(filePath, projectPath)
        commitHistorys = Shell.getCommitIds(commitHistorys)
        const options = { filePath, projectPath }
        if (commitHistorys.length <= 1) {
            throw new Error('提交次数不足，无法比较')
        }
        // 获取提交时间、作者
        let diffString = ''
        for (let i = 0; i < commitHistorys.length - 1; i++) {
            const { updateTime, user, commitId } = commitHistorys[i]
            const commitIdDiff = commitHistorys[i + 1].commitId
            res = git.diff(commitId, commitIdDiff, options)
            if (diffString) { diffString += ' \n ' }
            diffString += `### 作者: ${user} \n`
            diffString += `#### 提交时间: ${updateTime} \n`
            diffString += `${res}`
        }
        fileServer.set(diffName, diffString)
        Shell.exec(`open ${fileServer.getPath(diffName)}`, 'Open File Fail')


        //进行选择
        // inquirer.clear()
        // inquirer.addQuestion({
        //     type: "number",
        //     name: "commitCount",
        //     message: "请选择比较当前版本之前第几次提交版本？",
        //     default: 1
        // })
        // res = await inquirer.prompt()
        // if (!(res.commitCount >= 1 && res.commitCount <= 100)){
        //     throw new Error('请输入正确的值')
        // }
        // result.commitCount = Math.round(res.commitCount)

        // 进行比较
        // const commitId = commitHistorys[result.commitCount]
        // if (!commitId) {
        //     throw new Error('选择提交版本错误')
        // }
        
        // res = git.diff(commitHistorys[0], commitId, { 
        //     filePath, 
        //     projectPath,
        //     customCmd: ``
        // })
    } catch (error) {
        throw error
    } finally {
        // 删除临时数据
        // console.info('删除临时项目：', projectPath)
        git.remove(projectPath)
    }
}

main(new Git(), new Inquirer(), new File(), Project).then(res => {
    // console.log('==res===', JSON.stringify(result, null, 2))
}).catch(err => {
    console.error('操作出错：', err)
});


process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);

    const git = new Git()

    // 删除临时数据
    // console.info('删除临时项目：', projectPath)
    git.remove(projectPath)
});