'use strict'

const test = require('tape')
const KeyLogger = require('../src/keylogger')

test('KEYLOGGER: Add a few chars', t => {
  const logger = new KeyLogger()

  t.equal(logger.getText(), '')
  logger._keyPressHandler({ key: 'm' })
  logger._keyPressHandler({ key: 'e' })
  t.equal(logger.getText(), 'me')

  t.end()
})

test('KEYLOGGER: Add some special chars', t => {
  const logger = new KeyLogger()

  logger._keyPressHandler({ key: 'm' })
  logger._keyPressHandler({ key: 'Backspace' })
  logger._keyPressHandler({ key: 'e' })
  logger._keyPressHandler({ key: 'Enter' })
  t.equal(logger.getText(), 'e\n')

  t.end()
})

test('KEYLOGGER: Callbacks', t => {
  const cb = text => t.equal(text, 'yes')
  const logger = new KeyLogger()

  logger._keyPressHandler({ key: 'y' })
  logger._keyPressHandler({ key: 'e' })
  logger.addListener(cb)
  logger._keyPressHandler({ key: 's' })
  t.equal(logger.getText(), 'yes')

  t.end()
})
