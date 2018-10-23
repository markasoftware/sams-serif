'use strict'

const samsSerif = {
  'I': {
    ratio: 1,
    renderer: (ctx, box, wrap) => {
      wrap(box, () => {
        const bounds = box.getBounds()
        ctx.moveTo(bounds.x0, bounds.y0)
        ctx.lineTo(bounds.x1, bounds.y1)
      })
    }
  }
}
module.exports = samsSerif
