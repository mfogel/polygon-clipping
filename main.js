const doOperation = require('./src/do-operation')
const operationTypes = require('./src/operation-types')

const union = (subject, clipping) =>
  doOperation(subject, clipping, operationTypes.UNION)

const difference = (subject, clipping) =>
  doOperation(subject, clipping, operationTypes.DIFFERENCE)

const xor = (subject, clipping) =>
  doOperation(subject, clipping, operationTypes.XOR)

const intersection = (subject, clipping) =>
  doOperation(subject, clipping, operationTypes.INTERSECTION)

module.exports = { union, difference, xor, intersection }
