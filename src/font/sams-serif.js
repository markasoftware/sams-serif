'use strict'

const Box = require('../box')

const samsSerif = opts => ({
  'I': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      renderILike(ctx, origBox, limiter, true, true, opts.IChildSize, opts.standardRatio)
    }
  },

  // mostly a copy-paste from I
  'T': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      renderILike(ctx, origBox, limiter, true, false, opts.TChildSize, opts.standardRatio)
    }
  },

  'L': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const bounds = origBox.getBounds()
      const dim = origBox.getDimensions()
      const ratio = opts.standardRatio

      // vertical lines
      let curTop = bounds.y0
      let curLeft = bounds.x0
      let curLength = dim.y

      let shouldContinue = true
      for (let i = 0; shouldContinue; i = (i + 1) % 4) {
        switch (i) {
          // down is down
          case 0:
            renderSegment({ x0: curLeft, x1: curLeft + curLength, y0: curTop, y1: curTop + curLength }, true, curLeft, curTop)
            curTop += curLength
            break
          // right is down
          case 1:
            renderSegment({ x0: curLeft, x1: curLeft + curLength, y0: curTop - curLength, y1: curTop }, false, curLeft, curTop)
            curLeft += curLength
            break
          // up is down
          case 2:
            renderSegment({ x0: curLeft - curLength, x1: curLeft, y0: curTop - curLength, y1: curTop }, true, curLeft, curTop - curLength)
            curTop -= curLength
            break
          // left is down
          case 3:
            renderSegment({ x0: curLeft - curLength, x1: curLeft, y0: curTop, y1: curTop + curLength }, false, curLeft - curLength, curTop)
            curLeft -= curLength
            break
        }

        curLength *= 0.8
      }

      function renderSegment(bounds, isVertical, lineLeft, lineTop) {
        const box = new Box(bounds)
        if (!limiter.shouldRender(box)) {
          shouldContinue = false
          return
        }
        limiter.preDraw(box.getRadius())
        const drawLine = isVertical ? limiter.drawVerticalLine.bind(limiter) : limiter.drawHorizontalLine.bind(limiter)
        drawLine(lineLeft, lineTop, curLength)
      }
    }
  },

  'O': {
    ratio: 1,
    render: (ctx, origBox, limiter) => {
      const childWidthCoefficient = opts.OChildSize

      if (!limiter.shouldRender(origBox)) {
        return
      }
      const center = origBox.getCenter()
      // the center distance from the edge is the radius
      findChildrenByCenter(center.x, center.y, origBox.getDimensions().x / 2)

      function findChildrenByCenter(x, y, radius) {
        limiter.preDraw(radius)
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
  },
})
module.exports = samsSerif

function renderILike (ctx, origBox, limiter, renderTop, renderBottom, childSize, ratio) {
      let findChildrenCount = 0
      let renderCount = 0
      // BEGIN CONFIGURATION
      const childWidthCoefficient = childSize
      // END CONFIGURATION

      // scaling a box around the main I by this will make it contain all children.
      // This is because infinite sum x^(-n) = 1/(x-1)
      const addChildrenCoefficient = 1 / (1 / childWidthCoefficient - 1) + 1
      const dim = origBox.getDimensions()
      const bounds = origBox.getBounds()

      // queue items: Box
      const queue = []
      // so nothing is equal to it, hehehe
      let lastRenderedRadius = NaN

      const allIs = []
      findChildrenByCenter(bounds.x1 - dim.x / 2, bounds.y1 - dim.y / 2, dim.y / 2)
      allIs
        .sort((a, b) => a.getRadius() - b.getRadius())
        .forEach(qItem => renderI(qItem))

      function findChildrenByCenter (x, y, verticalRadius) {
        findChildrenCount++
        const horizontalRadius = verticalRadius * ratio
        const bounds = {
          x0: x - horizontalRadius,
          x1: x + horizontalRadius,
          y0: y - verticalRadius,
          y1: y + verticalRadius
        }
        const box = new Box(bounds)
        const boxWithChildren = new Box(bounds)
        boxWithChildren.scale(addChildrenCoefficient)

        if (!limiter.shouldRender(boxWithChildren)) {
          return
        }
        // draw children first so light colored stuff doesn't overdraw our rects
        const childVR = verticalRadius * childWidthCoefficient
        allIs.push(box)
        if (limiter.shouldRenderRadius(box.getRadius() * childWidthCoefficient)) {
          if (renderTop) {
            findChildrenByCenter(bounds.x0, bounds.y0, childVR)
            findChildrenByCenter(bounds.x1, bounds.y0, childVR)
          }
          if (renderBottom) {
            findChildrenByCenter(bounds.x1, bounds.y1, childVR)
            findChildrenByCenter(bounds.x0, bounds.y1, childVR)
          }
        }
      }

      function renderI (box) {
        renderCount++
        const bounds = box.getBounds()
        if (box.getRadius() !== lastRenderedRadius) {
          lastRenderedRadius = box.getRadius()
          limiter.preDraw(box.getRadius())
        }
        if (renderTop) {
          limiter.drawHorizontalLine(bounds.x0, bounds.y0, bounds.x1 - bounds.x0)
        }
        if (renderBottom) {
          limiter.drawHorizontalLine(bounds.x0, bounds.y1, bounds.x1 - bounds.x0)
        }
        limiter.drawVerticalLine(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y0, bounds.y1 - bounds.y0)
      }

      console.log(`Found children ${findChildrenCount} times, rendered ${renderCount} times.`)
}
