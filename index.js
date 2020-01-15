var inquirer = require('inquirer');
var prompt = inquirer.createPromptModule();
const config = require('./index.config.json')

let q = {
    "questions": [
        {
            "type": "input",
            "name": "projectNameNMeedContinue",
            "when": false
        },
        {
            "type": "input",
            "name": "projectName",
            "message": "请为你想要创建的项目命名",
            "default": "test",
            "when": function (res) {
                console.log('when', res)
                return true
            }
        }, {
            "type": "list",
            "name": "questionType",
            "message": "请选择项目问题的类型",
            "default": "A",
            "choices": [
                {
                    "value": "问答模式"
                },
                {
                    "value": "列表选择模式"
                }
            ]
        }, {
            "type": "confirm",
            "name": "isContinue",
            "message": "还要继续添加问题吗？",
            "default": false,
        }
    ]
}

const result = {}
let index = 0
async function main(questions, isFirst=true) {
    await prompt(questions).then(async (res) => {
        Object.assign(result, res)
        if(res.isContinue) {
            if (isFirst) {
                // questions = questions.filter(qu => qu.name !== 'projectName')
            }
            questions = questions.map(qu => {
                if (Object.keys(result).filter(key => key !== 'isContinue').includes(qu.name)) {
                    qu.name = `${qu.name.split('-').map(e => {
                        if (Number(e) === index - 1) {
                            return ''
                        }
                        return e
                    }).filter(e => e).join('-')}-${index++}`
                }
                return qu
            })
            await main(questions, false)
        }
    })
}

main(q.questions).then(res => {
    console.log('==res===', JSON.stringify(result, null, 2))
}).catch(err => {
    console.error('你错了！！！', err)
});