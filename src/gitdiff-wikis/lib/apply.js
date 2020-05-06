#!/usr/bin/env node

const util = require('./utils')
const File = require('./file')
const shell = require('./shell')

let argv = (process.argv.slice(2) || []).filter(e => !/^-/.test(e));
console.log('argv:', argv)

const fileServer = new File()

let selectVersion = argv[0] && util.addV(util.removeV(argv[0])) || null
console.log('selectVersion:', selectVersion)

if (selectVersion && !util.validateVersion(selectVersion)) {
  throw new Error(`Input Version Is Not Allow Style ${selectVersion}` )
}

let cratTemplate = 'cra-template-crat'
if (argv[1]) { cratTemplate = argv[1] } 
console.log('cratTemplate: ', cratTemplate)
cratTemplate = require(cratTemplate)

const currentVersion = util.addV(util.removeV(cratTemplate.currentVersion))
console.log('currentVersion: ', currentVersion)

if (!selectVersion) {
  selectVersion = currentVersion
} else if (util.compareVersions(selectVersion, currentVersion)) {
  throw new Error(`Not Allow Apply Version ${selectVersion} , Currect Version ${currentVersion}`)
}

const diffPath = cratTemplate.diffPath
if (!fileServer.existDir(diffPath)) {
  throw new Error('Diff is not found')
}

const selectVersionDirPath = fileServer.getPath(selectVersion, diffPath)

if (!fileServer.existDir(selectVersionDirPath)) {
  throw new Error(`Diff Version is not found ${selectVersionDirPath}`)
}
const selectVersionPatchPath = fileServer.getPath('patch.diff', selectVersionDirPath)
shell.exec(`git apply ${selectVersionPatchPath}`, 'Git Apply Fail ')



