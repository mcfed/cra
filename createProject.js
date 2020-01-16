const shell = require('shelljs');
var compareVersions = require('compare-versions');

module.exports = function ({ projectName, scriptName, useNpm, usePnp }) {
    if (!shell.which('create-react-app')) {
        shell.echo('Sorry, this script requires create-react-app');
        shell.exit(1);
    }
    if (compareVersions(shell.exec('create-react-app -V').stdout.trim(), '3.2.0') === 1 ) {
        shell.echo('Sorry, this version of create-react-app need less than 3.2.0');
        shell.exit(1);
    }
     // Run external tool synchronously
    let shellScripts = `create-react-app ${projectName} --scripts-version ${scriptName} `
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