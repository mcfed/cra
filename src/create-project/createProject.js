const path = require('path')
const fs = require('fs')
const url = require('url')
const shell = require('shelljs');
const tmp = require('tmp');
const hyperquest = require('hyperquest');
const compareVersions = require('compare-versions');
const chalk = require('chalk');
const unpack = require('tar-pack').unpack;
const spawn = require('cross-spawn');
const cratPackage = require('../../package.json')
const HomePath = process.env.HOME
const Pwd = process.env.PWD
const templateJson = 'template.json'
const cratVersion = cratPackage.version
const creatReactAppCommandPath = path.join(__dirname, '../../node_modules/.bin/create-react-app')

function checkVision() {
    // if (!shell.which('create-react-app')) {
    //     shell.echo('Sorry, this script requires create-react-app');
    //     shell.exit(1);
    // }
    if (compareVersions(shell.exec(`${creatReactAppCommandPath} -V`).stdout.trim(), '3.2.0') !== 1 ) {
        // < 3.2.0
        shell.echo('Sorry, this version of create-react-app need more than 3.2.0');
        shell.exit(1);
    }
}

function createProject({ projectName, templatePath, useNpm, usePnp  }) {
    let shellScripts = `${creatReactAppCommandPath} ${projectName} --template ${templatePath} `

     // Run external tool synchronously
    if (useNpm || usePnp) {
        if (useNpm) {
            shellScripts += '--use-npm'
        } else {
            shellScripts += '--use-pnp'
        }
    }

    if (shell.exec(shellScripts).code !== 0) {
        shell.echo('Error: Create React App failed');
        shell.exit(1);
    }
}

async function installTemplate(projectName, templatePath) {
  const templateInfo = getTemplateInstallPackage(templatePath)
  const packageInfo = await getPackageInfo(templateInfo)
  const projectPath = path.join(Pwd, projectName)
  await install(projectPath, [packageInfo.name])
  return require(path.join(projectPath, 'node_modules', packageInfo.name))
}

async function installProject({ projectName, templatePath, useNpm, usePnp  }) {

    // 安装可选安装包---模版包
    const { 
      templatePath: templateDirPath, 
      templateJsonPath 
    } = await installTemplate(projectName, templatePath)
    console.log('templateDirPath is ', templateDirPath)

    const privateDependencies = 'privateDependencies'
    const tmpDevDependencies = 'tmpDevDependencies'
    const devDependencies = 'devDependencies'
    const templateJson = require(templateJsonPath)
    const package = templateJson && templateJson.package || {}

    const projectPackagePath = path.join(Pwd, projectName, 'package.json')
    const projectPackage = require(projectPackagePath)

    // 因为私有库的包不支持安装所以外部安装，安装包在模版包的template.json文件的privateDependencies中
    if (package[privateDependencies] && typeof package[privateDependencies] === 'object' && !Array.isArray(package[privateDependencies])) {
        projectPackage.dependencies = Object.assign({}, projectPackage.dependencies, package[privateDependencies])
        delete projectPackage[privateDependencies]
    }

    // 因为package.json中的一些字段有黑名单，所以想要生成这些字段要后期处理
    if (package[tmpDevDependencies] && typeof package[tmpDevDependencies] === 'object' && !Array.isArray(package[tmpDevDependencies])) {
        projectPackage[devDependencies] = package[tmpDevDependencies] || {}

        // add mcf-cra
        projectPackage[devDependencies][cratPackage.name] = cratVersion

        // add customize-cra
        addCustomizeCra(projectPackage)

        // delete
        delete projectPackage[tmpDevDependencies]
    }

    fs.writeFileSync(projectPackagePath, JSON.stringify(projectPackage, null, 2), 'utf8')
}

function addCustomizeCra(projectPackage) {
    // fix scripts
    if (!projectPackage.scripts) { projectPackage.scripts = {} }
    projectPackage.scripts.start = "react-app-rewired start"
    projectPackage.scripts.build = "react-app-rewired build"
    projectPackage.scripts.test = "react-app-rewired test"
    projectPackage.scripts["build:cjs"] = "MODE=cjs react-app-rewired build"
    projectPackage.scripts["build:umd"] = "MODE=umd react-app-rewired build"

    // package react-app-rewired ^1.0.8
    if (!projectPackage.devDependencies) { projectPackage.devDependencies = {} }
    projectPackage.devDependencies["react-app-rewired"] = "^1.0.8"
}

function getTemplateInstallPackage(template) {
    const originalDirectory = process.cwd()
    let templateToInstall = 'cra-template';
    if (template) {
      if (template.match(/^file:/)) {
        templateToInstall = `file:${path.resolve(
          originalDirectory,
          template.match(/^file:(.*)?$/)[1]
        )}`;
      } else if (
        template.includes('://') ||
        template.match(/^.+\.(tgz|tar\.gz)$/)
      ) {
        // for tar.gz or alternative paths
        templateToInstall = template;
      } else {
        // Add prefix 'cra-template-' to non-prefixed templates, leaving any
        // @scope/ intact.
        const packageMatch = template.match(/^(@[^/]+\/)?(.+)$/);
        const scope = packageMatch[1] || '';
        const templateName = packageMatch[2];
  
        if (
          templateName === templateToInstall ||
          templateName.startsWith(`${templateToInstall}-`)
        ) {
          // Covers:
          // - cra-template
          // - @SCOPE/cra-template
          // - cra-template-NAME
          // - @SCOPE/cra-template-NAME
          templateToInstall = `${scope}${templateName}`;
        } else if (templateName.startsWith('@')) {
          // Covers using @SCOPE only
          templateToInstall = `${templateName}/${templateToInstall}`;
        } else {
          // Covers templates without the `cra-template` prefix:
          // - NAME
          // - @SCOPE/NAME
          templateToInstall = `${scope}${templateToInstall}-${templateName}`;
        }
      }
    }
  
    return templateToInstall;
}

function getPackageInfo(installPackage) {
  if (installPackage.match(/^.+\.(tgz|tar\.gz)$/)) {
    return getTemporaryDirectory()
      .then(obj => {
        let stream;
        if (/^http/.test(installPackage)) {
          stream = hyperquest(installPackage);
        } else {
          stream = fs.createReadStream(installPackage);
        }
        return extractStream(stream, obj.tmpdir).then(() => obj);
      })
      .then(obj => {
        const { name, version } = require(path.join(
          obj.tmpdir,
          'package.json'
        ));
        obj.cleanup();
        return { name, version };
      })
      .catch(err => {
        // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
        // However, this function returns package name only without semver version.
        console.log(
          `Could not extract the package name from the archive: ${err.message}`
        );
        const assumedProjectName = installPackage.match(
          /^.+\/(.+?)(?:-\d+.+)?\.(tgz|tar\.gz)$/
        )[1];
        console.log(
          `Based on the filename, assuming it is "${chalk.cyan(
            assumedProjectName
          )}"`
        );
        return Promise.resolve({ name: assumedProjectName });
      });
  } else if (installPackage.startsWith('git+')) {
    // Pull package name out of git urls e.g:
    // git+https://github.com/mycompany/react-scripts.git
    // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
    return Promise.resolve({
      name: installPackage.match(/([^/]+)\.git(#.*)?$/)[1],
    });
  } else if (installPackage.match(/.+@/)) {
    // Do not match @scope/ when stripping off @version or @tag
    return Promise.resolve({
      name: installPackage.charAt(0) + installPackage.substr(1).split('@')[0],
      version: installPackage.split('@')[1],
    });
  } else if (installPackage.match(/^file:/)) {
    const installPackagePath = installPackage.match(/^file:(.*)?$/)[1];
    const { name, version } = require(path.join(
      installPackagePath,
      'package.json'
    ));
    return Promise.resolve({ name, version });
  }
  return Promise.resolve({ name: installPackage });
}

function getTemporaryDirectory() {
  return new Promise((resolve, reject) => {
    // Unsafe cleanup lets us recursively delete the directory if it contains
    // contents; by default it only allows removal if it's empty
    tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          tmpdir: tmpdir,
          cleanup: () => {
            try {
              callback();
            } catch (ignored) {
              // Callback might throw and fail, since it's a temp directory the
              // OS will clean it up eventually...
            }
          },
        });
      }
    });
  });
}

function extractStream(stream, dest) {
  return new Promise((resolve, reject) => {
    stream.pipe(
      unpack(dest, err => {
        if (err) {
          reject(err);
        } else {
          resolve(dest);
        }
      })
    );
  });
}

async function install(root, dependencies) {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (true) {
      command = 'yarnpkg';
      args = ['add', '--optional'];
      [].push.apply(args, dependencies);

      // Explicitly set cwd() to work around issues like
      // https://github.com/facebook/create-react-app/issues/3326.
      // Unfortunately we can only do this for Yarn because npm support for
      // equivalent --prefix flag doesn't help with this issue.
      // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
      args.push('--cwd');
      args.push(root);
    }

    // if (true) {
    //   args.push('--verbose');
    // }
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

async function rmProject(projectName) {
  const projectPath = path.join(Pwd, projectName)
  const shellScripts = `rm -rf ${projectPath}`
  if (shell.exec(shellScripts).code !== 0) {
    shell.echo('Error: Create React App failed');
    shell.exit(1);
}
}

module.exports = {
    checkVision,
    createProject,
    installProject,
    rmProject
}