const Cellery = require('./lib/cellery')
const cells = require('./lib/cells')
const decoration = require('./lib/decorations')

module.exports = {
  Cellery,
  ...cells,
  ...decoration
}
