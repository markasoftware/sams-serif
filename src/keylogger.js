'use strict'

const assert = require('assert')
const isMobile = require('is-mobile')

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
    if (typeof InputEvent !== 'undefined' && e instanceof InputEvent) {
      if (e.data.length > 0) {
        this.text += e.data[0]
      }
    } else {
      if (e.key.length === 1) {
        this.text += e.key
      } else if (e.key === 'Enter') {
        this.text += '\n'
      } else if (e.key === 'Backspace') {
        this.text = this.text.slice(0, -1)
      }
    }

    this._textUpdated()
  }

  _addEventListeners () {
    assert(this.el)
    if (isMobile({ tablet: true })) {
      this.el.addEventListener('beforeinput', this._keyPressHandler.bind(this))
    } else {
      this.el.addEventListener('keydown', this._keyPressHandler.bind(this))
    }
  }

  static stopPropagation (el) {
    el.addEventListener('keydown', e => e.stopPropagation())
    el.addEventListener('beforeinput', e => e.stopPropagation())
  }
}
