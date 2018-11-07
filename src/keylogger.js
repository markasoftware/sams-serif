'use strict'

const assert = require('assert')

module.exports = class Keylogger {
  constructor () {
    this.text = ''
    this.cbs = []
  }

  linkEl (el) {
    this.el = el
    this._addEventListeners()
  }

  addListener (cb) {
    this.cbs.push(cb)
  }

  getText () {
    return this.text
  }

  _textUpdated () {
    this.cbs.forEach(cb => cb(this.getText()))
  }

  _keyPressHandler (e) {
    e.stopPropagation()
    if (e.key.length === 1) {
      this.text += e.key
    } else if (e.key === 'Enter') {
      this.text += '\n'
    } else if (e.key === 'Backspace') {
      this.text = this.text.slice(0, -1)
    }

    this._textUpdated()
  }

  _addEventListeners () {
    assert(this.el)
    this.el.addEventListener('keydown', this._keyPressHandler.bind(this), true)
  }

  static stopPropagation (el) {
    el.addEventListener('keydown', e => e.stopPropagation())
  }
}
