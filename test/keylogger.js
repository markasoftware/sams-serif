'use strict'

const test = require('tape')
const KeyLogger = require('../src/keylogger')

test('KEYLOGGER: Add a few chars', t => {
  const logger = new KeyLogger()
  
  t.equal(logger.getText(), '')
  logger._keyPressHandler({ char: 'm'})
  logger._keyPressHandler({ char: 'e'})
  t.equal(logger.getText(), 'me')
  
  t.end()
})

test('KEYLOGGER: Add some special chars', t => {
  const logger = new KeyLogger()
  
  logger._keyPressHandler({ char: 'm'})
  logger._keyPressHandler({ char: '', key: 'Backspace'})
  logger._keyPressHandler({ char: 'e'})
  logger._keyPressHandler({ char: '', key: 'Enter'})
  t.equal(logger.getText(), 'e\n')
  
  t.end()
})

test('KEYLOGGER: Callbacks', t => {
  const cb = text => t.equal(text, 'yes')
  const logger = new KeyLogger()
  
  logger._keyPressHandler({ char: 'y' })
  logger._keyPressHandler({ char: 'e' })
  logger.addListener(cb)
  logger._keyPressHandler({ char: 's' })
  t.equal(logger.getText(), 'yes')
  
  t.end()
})
