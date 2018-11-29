'use strict'

const assert = require('assert')
const mapValues = require('just-map-values')

const Box = require('../box')
const PointCluster = require('../point-cluster')
const Point = require('../point')

const deg = Math.PI / 180

const samsSerif = opts => ({
  ' ': {
    ratio: opts.spaceRatio,
    render: () => null
  },

  'B': {
    // TODO: probably use a separate ratio because it can't be below 0.5 for B
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const ratio = opts.standardRatio
      assert(ratio >= 0.5)

      const wholeRadius = origBox.getRadius()
      const xLeft = Math.floor(origBox.getBounds().x0 + limiter.getWidthByRadius(wholeRadius) / 2)
      // what fraction of each character's height is the width that should be used for straight lines
      const straightLineRatio = ratio - 0.5

      limiter.threePartRender(find, toRadius, draw)

      limiter.preDraw(wholeRadius)
      limiter.drawVerticalLine(origBox.getBounds().x0, origBox.getBounds().y0, origBox.getDimensions().y)
      // the children do not draw their bottom lines
      limiter.drawHorizontalLine(xLeft, origBox.getBounds().y1, Math.ceil(origBox.getDimensions().y * straightLineRatio))

      function find (pushToMe) {
        findChildren({
          height: origBox.getDimensions().y,
          yTop: origBox.getBounds().y0
        }, pushToMe)
      }

      function findChildren (parent, pushToMe) {
        // TODO: Why does the outer B disappear when you drag it to the bottom (halfway through the line or so, only width visible) but the inner ones do not?
        if (!limiter.shouldRender(new Box({
          x0: xLeft,
          x1: xLeft + parent.height * ratio,
          y0: parent.yTop,
          y1: parent.yTop + parent.height
        }))) {
          return
        }
        pushToMe.push(parent)
        // because there are only two we don't need to bother checking radius in the parent recursor
        findChildren({
          height: parent.height / 2,
          yTop: parent.yTop
        }, pushToMe)
        findChildren({
          height: parent.height / 2,
          yTop: parent.yTop + parent.height / 2
        }, pushToMe)
      }

      function toRadius (c) {
        return Math.sqrt(c.height ** 2 + (c.height * ratio) ** 2) / 2
      }

      function draw (c) {
        const straightWidth = Math.ceil(c.height * straightLineRatio)
        limiter.drawHorizontalLine(xLeft, c.yTop, straightWidth)
        limiter.drawHorizontalLine(xLeft, c.yTop + c.height / 2, straightWidth)
        ctx.moveTo(xLeft + straightWidth, c.yTop)
        ctx.arc(xLeft + straightWidth, c.yTop + c.height / 4, c.height / 4, -Math.PI / 2, Math.PI / 2)
        ctx.moveTo(xLeft + straightWidth, c.yTop + c.height / 2)
        ctx.arc(xLeft + straightWidth, c.yTop + c.height * 3 / 4, c.height / 4, -Math.PI / 2, Math.PI / 2)
      }
    }
  },

  'E': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const initLength = origBox.getDimensions().x
      const verticalLineWidth = limiter.getWidthByRadius(origBox.getDimensions().y / 2)
      const xLeft = Math.floor(origBox.getBounds().x0 + verticalLineWidth / 2)

      limiter.threePartRender(find, toRadius, draw)

      // vertical line
      limiter.preDraw(origBox.getDimensions().y / 2)
      limiter.drawVerticalLine(origBox.getBounds().x0, origBox.getBounds().y0, origBox.getDimensions().y)

      // big top and bottom lines. Yeah Linus, it's not "good taste"
      draw({ y: origBox.getBounds().y0, length: initLength })
      draw({ y: origBox.getBounds().y1, length: initLength })

      function find (pushToMe) {
        findELegs(origBox.getCenter().y, origBox.getDimensions().y / 4, initLength, pushToMe)
      }

      /**
       * @param {number} the y position of the center thing
       * @param {number} yRadius how far from the y center the next, smaller legs should be
       * @param {number} the length of the leg at the center
       */
      function findELegs (yCenter, yRadius, length, pushToMe) {
        if (limiter.shouldRender(new Box({
          x0: xLeft,
          x1: xLeft + length,
          y0: yCenter - yRadius * 2,
          y1: yCenter + yRadius * 2
        }))) {
          pushToMe.push({ y: yCenter, length })
          if (limiter.shouldRenderRadius(length * opts.ELegSize / 2)) {
            findELegs(yCenter - yRadius, yRadius / 2, length * opts.ELegSize, pushToMe)
            findELegs(yCenter + yRadius, yRadius / 2, length * opts.ELegSize, pushToMe)
          }
        }
      }

      function toRadius (c) {
        return c.length / 2
      }

      function draw (queueItem) {
        limiter.drawHorizontalLine(xLeft, queueItem.y, queueItem.length)
      }
    }
  },

  'I': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      renderILike(ctx, origBox, limiter, true, true, opts.IChildSize, opts.standardRatio)
    }
  },

  'K': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const ratio = opts.standardRatio
      const childUseTop = opts.KByTop
      const childAngle = opts.KChildAngleDeg * deg
      const childSize = opts.KChildSize
      const childPositionYRatio = -(1 - opts.KChildPosition) / 2
      const childPositionXRatio = opts.KChildPosition * ratio

      limiter.threePartRender(find, toRadius, draw)

      // Point cluster for K is simply the bounding box. Derp.
      // starts at topLeft, then clockwise
      function find (pushToMe) {
        const origBounds = origBox.getBounds()
        const pc = new PointCluster({
          topLeft: new Point({ x: origBounds.x0, y: origBounds.y0 }),
          topRight: new Point({ x: origBounds.x1, y: origBounds.y0 }),
          bottomRight: new Point({ x: origBounds.x1, y: origBounds.y1 }),
          bottomLeft: new Point({ x: origBounds.x0, y: origBounds.y1 })
        })
        findChildren(pc, 0, pushToMe)
      }

      // less optimization here than in most other letter so far because
      // recursion is linear in complexity (like the L)
      function findChildren (pc, angle, pushToMe) {
        pushToMe.push(pc)

        const points = pc.getPoints()
        const height = points.topLeft.distanceTo(points.bottomLeft)

        const parentCartesian = (childUseTop ? points.topLeft : points.bottomLeft).asCartesian()
        const childCorner = new Point(points.bottomLeft)
        childCorner.transform({
          type: 'translate',
          x: height * childPositionXRatio,
          // negative because it should be above previous
          y: height * childPositionYRatio,
          angle
        })
        const childCartesian = new Point(childCorner)

        const childPc = new PointCluster(pc)
        childPc.transform({
          type: 'translate',
          x: childCartesian.x - parentCartesian.x,
          y: childCartesian.y - parentCartesian.y
        })
        childPc.transform({
          type: 'rotate',
          center: childCartesian,
          angle: childAngle
        })
        childPc.transform({
          type: 'scale',
          scale: childSize,
          center: childCartesian
        })

        // we cannot accurately determine the area that a K, with children,
        // will take up, so we only stop renders based on radius
        if (limiter.shouldRenderRadius(toRadius(childPc))) {
          findChildren(childPc, angle + childAngle, pushToMe)
        }
      }

      function toRadius (pc) {
        const points = pc.getPoints()
        return points.topLeft.distanceTo(points.bottomRight) / 2
      }

      function draw (pc) {
        const points = pc.getPoints()
        const centerLeft = points.topLeft.midpointTo(points.bottomLeft).asCartesian()
        const cartesians = mapValues(points, c => c.asCartesian())
        ctx.moveTo(cartesians.topLeft.x, cartesians.topLeft.y)
        ctx.lineTo(cartesians.bottomLeft.x, cartesians.bottomLeft.y)
        // to center left
        ctx.moveTo(centerLeft.x, centerLeft.y)
        // lower leg
        ctx.lineTo(cartesians.bottomRight.x, cartesians.bottomRight.y)
        // center left again
        ctx.moveTo(centerLeft.x, centerLeft.y)
        // upper leg
        ctx.lineTo(cartesians.topRight.x, cartesians.topRight.y)
      }
    }
  },

  'L': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const bounds = origBox.getBounds()
      const dim = origBox.getDimensions()

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

        curLength *= opts.LChildSize
      }

      function renderSegment (bounds, isVertical, lineLeft, lineTop) {
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
      const childCount = opts.OChildCount
      /*
       * There's quite a bit of math that must go into this. It is easiest to start from knowing that
       * the distance between the centers of two adjacent marginal circles is equal to the diameter of
       * a single marginal circle. Then, you can setup an equation relating the outer radius and the
       * marginal circle radius using basic trigonometry and the pythagorean theorem. Run it through
       * wolfram alpha to simplify, and...
       */
      const childWidthMultiplier = Math.sin(Math.PI / childCount) / (Math.sin(Math.PI / childCount) + 1)
      const innerWidthMultiplier = -2 * Math.sin(Math.PI / childCount) / (Math.sin(Math.PI / childCount) + 1) + 1

      if (!limiter.shouldRender(origBox)) {
        return
      }
      const center = origBox.getCenter()

      limiter.threePartRender(find, toRadius, draw)

      function find (pushToMe) {
        findChildrenByCenter(center.x, center.y, origBox.getDimensions().x / 2, pushToMe)
      }

      function findChildrenByCenter (x, y, radius, pushToMe) {
        if (!limiter.shouldRender(new Box({ x0: x - radius, x1: x + radius, y0: y - radius, y1: y + radius }))) {
          return
        }
        pushToMe.push({ x, y, radius })

        const childRadius = radius * childWidthMultiplier
        const innerRadius = radius * innerWidthMultiplier
        const toChildRadius = radius * (childWidthMultiplier + innerWidthMultiplier)
        if (limiter.shouldRenderRadius(childRadius)) {
          for (let i = 0; i < childCount; i++) {
            const theta = Math.PI * 2 * (i / childCount)
            findChildrenByCenter(
              Math.cos(theta) * toChildRadius + x,
              Math.sin(theta) * toChildRadius + y,
              childRadius,
              pushToMe
            )
          }
        }

        if (limiter.shouldRenderRadius(innerRadius) && opts.OInner) {
          findChildrenByCenter(x, y, innerRadius, pushToMe)
        }
      }

      function toRadius (c) {
        return c.radius
      }

      function draw (queueItem) {
        ctx.moveTo(queueItem.x + queueItem.radius, queueItem.y)
        ctx.arc(queueItem.x, queueItem.y, queueItem.radius, 0, Math.PI * 2)
      }
    }
  },

  'T': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      renderILike(ctx, origBox, limiter, true, false, opts.TChildSize, opts.standardRatio)
    }
  }

})
module.exports = samsSerif

function renderILike (ctx, origBox, limiter, renderTop, renderBottom, childSize, ratio) {
  // BEGIN CONFIGURATION
  const childWidthMultiplier = childSize
  // END CONFIGURATION

  // scaling a box around the main I by this will make it contain all children.
  // This is because infinite sum x^(-n) = 1/(x-1)
  const addChildrenMultiplier = 1 / (1 / childWidthMultiplier - 1) + 1
  const dim = origBox.getDimensions()
  const bounds = origBox.getBounds()

  limiter.threePartRender(find, toRadius, draw)

  function find (pushToMe) {
    findChildrenByCenter(bounds.x1 - dim.x / 2, bounds.y1 - dim.y / 2, dim.y / 2, pushToMe)
  }

  function findChildrenByCenter (x, y, verticalRadius, pushToMe) {
    const horizontalRadius = verticalRadius * ratio
    const bounds = {
      x0: x - horizontalRadius,
      x1: x + horizontalRadius,
      y0: y - verticalRadius,
      y1: y + verticalRadius
    }
    const box = new Box(bounds)
    const boxWithChildren = new Box(bounds)
    boxWithChildren.scale(addChildrenMultiplier)

    if (!limiter.shouldRender(boxWithChildren)) {
      return
    }
    // draw children first so light colored stuff doesn't overdraw our rects
    const childVR = verticalRadius * childWidthMultiplier
    pushToMe.push(box)
    if (limiter.shouldRenderRadius(box.getRadius() * childWidthMultiplier)) {
      if (renderTop) {
        findChildrenByCenter(bounds.x0, bounds.y0, childVR, pushToMe)
        findChildrenByCenter(bounds.x1, bounds.y0, childVR, pushToMe)
      }
      if (renderBottom) {
        findChildrenByCenter(bounds.x1, bounds.y1, childVR, pushToMe)
        findChildrenByCenter(bounds.x0, bounds.y1, childVR, pushToMe)
      }
    }
  }

  function toRadius (box) {
    return box.getRadius()
  }

  function draw (box) {
    const bounds = box.getBounds()
    if (renderTop) {
      limiter.drawHorizontalLine(bounds.x0, bounds.y0, bounds.x1 - bounds.x0)
    }
    if (renderBottom) {
      limiter.drawHorizontalLine(bounds.x0, bounds.y1, bounds.x1 - bounds.x0)
    }
    limiter.drawVerticalLine(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y0, bounds.y1 - bounds.y0)
  }
}
