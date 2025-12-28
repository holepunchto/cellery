const html = require('./html-renderer')
const tui = require('./tui-renderer')

module.exports = { ...html, ...tui }
