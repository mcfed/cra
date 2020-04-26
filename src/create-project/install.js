const shell = require('shelljs');

const shellScripts = 'npm install create-react-app -g'

async function main() {
    if (!shell.which('npm')) {
        shell.echo('Sorry, this script requires npm');
        shell.exit(1);
    }
    console.log('install start...')
    if (shell.exec(shellScripts).code !== 0) {
        shell.echo('Error: Create React App Install failed');
        shell.exit(1);
    } else {
        console.log('install complete')
    }
}

main().then(res => {
    // console.log('==res===', JSON.stringify(result, null, 2))
}).catch(err => {
    console.error('安装出错', err)
});
