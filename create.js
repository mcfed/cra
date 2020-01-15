var inquirer = require('inquirer');
const createProject = require('./createProject')
var prompt = inquirer.createPromptModule();

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
            "name": "scriptName",
            "message": "是否配置其他指定的--scripts-version",
            "default": "@mcf/react-scripts"
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

async function main(questions) {
    await prompt(questions).then(async (res) => {
        console.log('==res===', JSON.stringify(res, null, 2))
        console.log('开始创建项目:', res.projectName)
        const time = Date.now()
        try {
            // 根据结果创建项目
            await createProject(res)
            console.log('耗费时间：', `${Date.now() - time} ms`)
        } catch (error) {
            console.log('项目创建失败:', error)
        }

    })
}

main(q.questions).then(res => {
    // console.log('==res===', JSON.stringify(result, null, 2))
}).catch(err => {
    console.error('你错了！！！', err)
});