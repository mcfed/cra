const compareVersions = require('compare-versions');

class Utils {
     
    removeV(version) {
        return version && version.replace(/^v|V/, '') || ''
    }
    addV(version) {
        return 'v'.concat(version)
    }

    existCurrentVersion(listVersions=[], currentVersion='') {
        return !!listVersions.find(version => this.removeV(version) === this.removeV(currentVersion))
    }
    validateVersion(version) {
        return compareVersions.validate(version)
    }
    compareVersions(v1, v2, o='>') {
        if (v1.indexOf('0.3.5') !== -1 && v2.indexOf('0.3.5') !== -1) {
            v1 = this.changeValue(v1)
            v2 = this.changeValue(v2)
        }
        return compareVersions.compare(this.removeV(v1), this.removeV(v2), o)
    }
    changeValue(v) {
        return v.split('-').map(e => e.replace(/[a-z]|[A-Z]/g, '')).join('.')
    }
}

module.exports = new Utils()