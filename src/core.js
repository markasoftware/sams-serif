'use strict'

const Box = require('./box')

module.exports = class Renderer {
  constructor (canvasCtx, canvasEl, baseViewport, font, opts = {}) {
    this.textHeight = opts.textHeight || 100
    this.verticalSpacing = opts.verticalSpacing || 30
    this.horizontalSpacing = opts.horizontalSpacing || 20
    this.verticalMargin = opts.verticalMargin || 100
    this.horizontalMargin = opts.horizontalMargin || 150

    this.font = font

    this.canvasCtx = canvasCtx
    this.canvasBox = new Box({ x0: 0, y0: 0, x1: canvasEl.width, y1 < canvasEl.height})
  }

  render (text) {
    this._resetCanvas()
    
    let curLeft = this.horizontalMargin
    let curTop = this.verticalMargin

    textArr.split('').forEach(char => {
      const fontChar = font[char];
      if (!fontChar) {
        return;
      }
      const height = this.textHeight;
      const width = fontChar.ratio * height;
      
      fontChar.render({ x0: curLeft, x1: curLeft + width, y0: curTop, y1: curTop + height}, this._wrapDraw.bind(this))
      
      curLeft += width + this.horizontalSpacing;
    })
  }
  
  _resetCanvas () {
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvasCtx.beginPath()
  }
  
  _wrapDraw (bounds, drawer) {
    if (!Box.boundsIntersect(bounds, this.canvasBox.getBounds())) {
      return;
    }
    
    canvasCtx.lineWidth = somethin;
  }
}
