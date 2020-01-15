const shell = require('shelljs');

module.exports = function ({ projectName, scriptName, useNpm, usePnp }) {
    if (!shell.which('create-react-app')) {
        shell.echo('Sorry,create project requires create-react-app');
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