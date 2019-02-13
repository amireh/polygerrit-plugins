const { analyze } = require('../logic')
const changes = require('./changes.json')

describe('ent::analyze', function() {
  it('calculates the parents of a change', function() {
    console.log(
      analyze(changes)
    )
  })
})
