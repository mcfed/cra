const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');
const chalk = require('chalk');
let Pwd = process.env.PWD
if (!Pwd) {
  Pwd = process.cwd()
}
module.exports = function main(renderProjectDir, moudleName) {
    return new Promise(async (resolve, reject) => {
        try {
            await creatModal(renderProjectDir, moudleName)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

async function creatModal(projectPath, moudleName) {
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
  if (moudleName) {
    tpl.namespace = moudleName
  }
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
    path.join(Pwd, `./${fileName}`)
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

// 模版替换函数
async function allRead(filePath, tpl) {
  try {
    const result = await fs.readdirSync(filePath)
    for (const fileName of result) {
      var filedir = path.join(filePath, fileName)
      if (/node_modules|\.git|\.jpg$|\.png$/.test(filedir)) {
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