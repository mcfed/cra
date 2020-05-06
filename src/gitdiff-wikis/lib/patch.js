#!/usr/bin/env node

const package = require('../package.json')
const util = require('./utils')
const File = require('./file')
const shell = require('./shell')

const Pwd = process.env.PWD

const fileServer = new File()
let versionDir = null
const argv = process.argv.slice(2) || [];
// const LangaugeType = argv.find(a => a === '--ts') ? 'ts' : 'js'
try {
    const currentVersion = package.version
    console.log('Version ', currentVersion)

    const diffPath = fileServer.getPath('./.diff', Pwd)
    fileServer.createDir(diffPath)
    // if (!fileServer.existDir(diffPath)) {
    //     throw new Error('Diff is not found')
    // }

    // const langaugeDir = fileServer.getPath(LangaugeType, diffPath)
    // if (!fileServer.existDir(langaugeDir)) {
    //     throw new Error(`Folder ${LangaugeType} is not found`)
    // }

    // const diffDirs = fileServer.getDirs(langaugeDir)

    // console.log('DiffDirs List ', diffDirs)

    // if (util.existCurrentVersion(diffDirs, currentVersion)) {
    //     throw new Error('Version Have Existed')  
    // }
    versionDir = fileServer.getPath(util.addV(util.removeV(currentVersion)), diffPath)

    console.log('Generate VersionDir ', versionDir)

    fileServer.createDir(versionDir)

    const patchDiffPath = fileServer.getPath('patch.diff', versionDir)

    shell.exec(`git diff > ${patchDiffPath}`)
    console.log('Generate diff version Complete')

    const diffContent = fileServer.get(patchDiffPath)

    const readmePath = fileServer.getPath('README.md', versionDir)
    let content = `## ${util.addV(util.removeV(currentVersion))} \n\n`
    content += diffContent
    fileServer.set(readmePath, content)

    console.log('Complete Patch')
} catch (error) {
    console.error('Patch Fail: ', error)
    fileServer.removeDir(versionDir)
}



