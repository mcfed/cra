#!/usr/bin/env node

var program = require('commander')

const package = require('../package.json')

program
  .version(package.version)
  .option('-c, --change-to-available-version', '安装可利用的create-react-app版本')
  .option('-d, --diff-gitlab-wiki-markdown', '比较wiki下文档的历史提交变更')
  .option('-p, --patch', '生成补丁')
  .option('-a, --apply', '应用补丁')  
  .option('-r, --render-project <moudleName> <templateDir> <newRenderProjectDir>', '渲染项目')
  .option('-s, --ssr-server', '启动ssr服务')
  .action(async function (commander) {
    if (commander.changeToAvailableVersion) {
      require('../src/create-project/install')
    } else if (commander.diffGitlabWikiMarkdown) {
      require('../src/gitdiff-wikis')
    }  else if (commander.patch) {
      require('../src/gitdiff-wikis/lib/patch')
    }  else if (commander.apply) {
      require('../src/gitdiff-wikis/lib/apply')
    } else if (commander.ssrServer) {
      require('../src/server')
    } else if (commander.renderProject) {
      try {
        require('../src/renderTemplate')(commander.renderProject, commander.args[0], commander.args[1])
      } catch (error) {
        console.error(error.stack)
      }
    } else {
      require('../src/create-project/create')
    }
  })
  .parse(process.argv)
