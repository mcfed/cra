#!/usr/bin/env node

var program = require('commander')
var fs = require('fs')
var path = require('path')

const package = require('../package.json')

program
  .version(package.version)
  .option('-c, --change-to-available-version', '安装可利用的create-react-app版本')
  .option('-d, --diff-gitlab-wiki-markdown', '比较wiki下文档的历史提交变更')
  .action(async function (commander) {
    if (commander.changeToAvailableVersion) {
      require('../src/create-project/install')
    } else if (commander.diffGitlabWikiMarkdown) {
      require('../src/gitdiff-wikis')
    } else {
      require('../src/create-project/create')
    }
  })
  .parse(process.argv)
