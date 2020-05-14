const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');
const inquirer = require('inquirer');
const chalk = require('chalk');
const prompt = inquirer.createPromptModule();
const HomePath = process.env.HOME
let Pwd = process.env.PWD
if (!Pwd) {
  Pwd = process.cwd()
}
// try {
//     main()
// } catch(err) {
//     console.error('渲染项目失败:', error)
// }

module.exports = function main(renderProjectDir) {
    return new Promise(async (resolve, reject) => {
        // let q = {
        //     "questions": [
        //         {
        //             "type": "input",
        //             "name": "renderProjectDir",
        //             "message": "请输入渲染项目的路径",
        //             "default": "当前目录"
        //         }
        //     ]
        // }
        // const res = await prompt(q.questions)

        // if (res.renderProjectDir === '当前目录') {
        //     res.renderProjectDir = Pwd
        // } else if (res.renderProjectDir.indexOf('/') === -1) {
        //     res.renderProjectDir = path.join(Pwd, res.renderProjectDir)
        // }
        try {
            await creatModal(renderProjectDir)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

async function creatModal(projectPath) {
  const crarc = await getFileByNameUseDefaultStrategy('.crarc')
  if (!crarc) {
    console.error('请配置model模版 crarc')
    return
  }
  if (!await fs.existsSync(projectPath)) {
    console.error('项目地址错误')
    return
  }
  console.log('.crarc path is ', crarc.path)

  let tpl = require(crarc.path)
  // console.log('replace files ...', JSON.stringify(tpl, 0, 2))
  await allRead(projectPath, tpl)
  console.log(chalk.green(`模块${tpl.namespace}创建成功`), projectPath)
}

// 使用相同策略获取获取文件
async function getFileByNameUseDefaultStrategy(fileName) {
  if (!fileName) {
    return null
  }

  // 当前命令运行目录下的
  let reuslt = await checkFileExistReturn(
    path.join(PWD, `./${fileName}`)
  );
  if (reuslt) {
    return reuslt
  }

  // 全局默认路径
  reuslt = await checkFileExistReturn(
    path.join(process.env.HOME || process.env.HOMEPATH, fileName)
  );
  if (reuslt) {
    return reuslt
  }

  // 包中默认模版
  reuslt = await checkFileExistReturn(
    path.join(__dirname, `../../${fileName}`)
  );
  if (reuslt) {
    return reuslt
  }

  return null;
  async function checkFileExistReturn(path) {
    if (await fs.existsSync(path)) {
      return { path }
    }
    return null
  }
}

// 复制文件夹
async function copyDir(oldPath, newPath) {
  try {
    await fs.copy(oldPath, newPath)
  } catch (error) {
    console.log(error)
  }
}

// 模版替换函数
async function allRead(filePath, tpl) {
  try {
    const result = await fs.readdirSync(filePath)
    for (const fileName of result) {
      var filedir = path.join(filePath, fileName)
      if (/node_modules|.git|.jpg$|.png$/.test(filedir)) {
        continue
      }
      var stats = fs.statSync(filedir)
      var isFile = stats.isFile() // 是文件
      var isDir = stats.isDirectory() // 是文件夹
      if (isFile) {
        await allReplace(filedir, tpl)
      }
      if (isDir) {
        await allRead(filedir, tpl)
      }
    }
  } catch (err) {
    console.log(err)
  }
}

// 创建modal
async function allReplace(path, tpl) {
  var data = await fs.readFileSync(path, 'utf8')
  var customTags = ['{@', '@}']
  try {
    var output = Mustache.render(data, tpl, {}, customTags)
    await fs.writeFileSync(path, output, 'utf8')
  } catch (error) {
    return
  }
}