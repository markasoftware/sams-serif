'use strict'

const assert = require('lazy-ass')

module.exports = class Keylogger {
  constructor () {
    this.text = ''
    this.cbs = []
  }
  
  linkEl(el) {
    this.el = el
    this._addEventListeners()
  }
  
  addListener(cb) {
    this.cbs.push(cb)
  }

  getText () {
    return this.text
  }
  
  _textUpdated() {
    this.cbs.forEach(cb => cb(this.getText()))
  }
  
  _keyPressHandler(e) {
    if (e.char.length > 0) {
      this.text += e.char
    } else if (e.key === 'Enter') {
      this.text += '\n'
    } else if (e.key === 'Backspace') {
      this.text = this.text.slice(0, -1)
    }
    
    this._textUpdated()
  }
  
  _addEventListeners () {
    assert(this.el)
    this.el.addEventListener('keypress', this._keyPressHandler.bind(this))
  }
}
