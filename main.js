const doOperation = require('./src/do-operation')
const operationType = require('./src/operation-type')

const union = (subject, clipping) =>
  doOperation(subject, clipping, operationType.UNION)

const difference = (subject, clipping) =>
  doOperation(subject, clipping, operationType.DIFFERENCE)

const xor = (subject, clipping) =>
  doOperation(subject, clipping, operationType.XOR)

const intersection = (subject, clipping) =>
  doOperation(subject, clipping, operationType.INTERSECTION)

module.exports = { union, difference, xor, intersection }
