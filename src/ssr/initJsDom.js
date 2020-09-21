const { JSDOM } = require('jsdom')
const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom
global.navigator = { userAgent: 'node.js' }
global.window = window
global.document = window.document
