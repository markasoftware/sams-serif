'use strict'

const samsSerif = {
  'I': {
    ratio: 1,
    render: (ctx, box, limiter) => {
      if (!limiter.shouldRender(box)) {
        console.log('Skipping I render')
        return
      }
      const bounds = box.getBounds()
      console.log('Rendering I');
      limiter.setupStroke(box)
      ctx.moveTo(bounds.x0, bounds.y0)
      ctx.lineTo(bounds.x1, bounds.y1)
    }
  }
}
module.exports = samsSerif
