'use strict'

const R = require('ramda')
const Panhandler = require('./panhandler')

const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
pan.linkEl(document.getElementById('bounded'))

setInterval(() => document.getElementById('bounds').textContent = JSON.stringify(R.map(Math.floor, pan.getBounds())), 100)
