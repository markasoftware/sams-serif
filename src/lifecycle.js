'use strict'

const KeyLogger = require('./keylogger')
const PanHandler = require('./panhandler')
const Renderer = require('./renderer')

module.exports = class Lifecycle {
  constructor(canvasEl, keyLoggerEl) {
    this.keyLogger = new KeyLogger()
    this.panHandler = new PanHandler()
    
    this.keyLogger.linkEl(keyLoggerEl)
    this.panHandler.linkEl(canvasEl)
  }
}
