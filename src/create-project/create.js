const inquirer = require('inquirer')
const path = require('path')
const chalk = require('chalk');
const { checkVision, createProject, installProject, rmProject } = require('./createProject')
const renderProject = require('./renderProject.js')
var prompt = inquirer.createPromptModule();
const Pwd = process.env.PWD

let q = {
    "questions": [
        {
            "type": "input",
            "name": "projectName",
            "message": "请为你想要创建的项目命名！",
            "default": "projectname",
            validate: function(val) {
                if(/^[a-z]*$/.test(val)) { // 校验
                    return true;
                }
                return "请输不允许带违法字符";
            }
        },
        {
            "type": "input",
            "name": "templatePath",
            "message": "指定模版路径--template",
            "default": "cra-template-crat"
        },
        {
            "type": "confirm",
            "name": "useNpm",
            "message": "是否使用NPM安装",
            "default": false
        },
        {
            "type": "confirm",
            "name": "usePnp",
            "message": "是否使用pnp安装",
            "default": false,
        }
    ]
}
function main(questions) {
    new Promise(async (resolve, reject) => {
        //  验证create-react-app版本
        checkVision()

        // 交互
        const res = await prompt(questions)
        console.log(chalk.green(`开始创建项目: ${res.projectName}, ${res.templatePath}`))
        const time = Date.now()
        try {
            // 根据结果创建项目
            createProject(res)

            // 安装项目
            console.log(chalk.green('创建项目完成，开始安装模版:'))
            await installProject(res)

            // 渲染项目安装模版
            await renderProject(path.join(Pwd, res.projectName))
            console.log(chalk.blue(`耗费时间：${Date.now() - time} ms`))
            
            resolve()
        } catch (error) {
            console.log(chalk.red(`项目创建失败: ${error.stack}`))
            reject(error)
        }
    }).catch(err => {
        rmProject(res.projectName)
        throw new Error(err)
    })
}
try {
    main(q.questions)
} catch(err) {
    console.error('创建项目出错：', err)
}

