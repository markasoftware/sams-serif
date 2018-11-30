'use strict'

const dat = require('dat.gui')
const isMobile = require('is-mobile')
const KeyLogger = require('./keylogger')

module.exports = class Config {
  constructor () {
    this.renderConfig = {
      horizontalSpacing: 2,
      verticalSpacing: 2,
      widthOverRadius: 0.05,
      minBlackRadius: 10,
      textHeightFrac: 0.5,
      minRadius: 2
    }
    this.samsSerifConfig = {
      standardRatio: 0.7,
      spaceRatio: 1,
      ELegSize: 0.5,
      IChildSize: 0.45,
      KChildAngleDeg: 45,
      KChildSize: 0.8,
      KChildPosition: 0.5,
      KByTop: false,
      LChildSize: 0.85,
      OChildCount: 5,
      OInner: true,
      RChildAngleDeg: 45,
      RChildSize: 0.8,
      RStraightWidth: 0.2,
      RLegHeight: 0.65,
      TChildSize: 0.5
    }

    this.dat = new dat.GUI()

    const datRender = this.dat.addFolder('Renderer Settings')
    const datSs = this.dat.addFolder("Sam's Serif Settings")

    this.controllers = [
      // I miss C with all its macros...
      datRender.add(this.renderConfig, 'horizontalSpacing', 0, 5),
      datRender.add(this.renderConfig, 'verticalSpacing', 0, 5),
      datRender.add(this.renderConfig, 'widthOverRadius', 0.01, 0.3),
      datRender.add(this.renderConfig, 'minRadius', 1, 10),
      datRender.add(this.renderConfig, 'minBlackRadius', 1, 100),
      datRender.add(this.renderConfig, 'textHeightFrac', 0.1, 1),

      datSs.add(this.samsSerifConfig, 'standardRatio', 0.01, 5),
      datSs.add(this.samsSerifConfig, 'spaceRatio', 0.01, 5),
      datSs.add(this.samsSerifConfig, 'ELegSize', 0.01, 0.99),
      datSs.add(this.samsSerifConfig, 'KChildAngleDeg', -180, 180),
      datSs.add(this.samsSerifConfig, 'KChildSize', 0.01, 0.995),
      datSs.add(this.samsSerifConfig, 'KChildPosition', 0, 1),
      datSs.add(this.samsSerifConfig, 'KByTop'),
      datSs.add(this.samsSerifConfig, 'LChildSize', 0.01, 0.99),
      datSs.add(this.samsSerifConfig, 'IChildSize', 0.01, 0.499),
      datSs.add(this.samsSerifConfig, 'OChildCount', 2, 40, 1),
      datSs.add(this.samsSerifConfig, 'OInner'),
      datSs.add(this.samsSerifConfig, 'RChildAngleDeg', -180, 180),
      datSs.add(this.samsSerifConfig, 'RChildSize', 0.01, 0.995),
      datSs.add(this.samsSerifConfig, 'RStraightWidth', 0, 1),
      datSs.add(this.samsSerifConfig, 'RLegHeight', 0, 1),
      datSs.add(this.samsSerifConfig, 'TChildSize', 0.01, 1)
    ]

    KeyLogger.stopPropagation(this.dat.domElement)

    // phone only
    if (isMobile()) {
      this.dat.closed = true
    }
  }

  addListener (cb) {
    this.controllers.forEach(c => c.onChange(cb))
  }

  getRenderOpts () {
    return this.renderConfig
  }

  getSamsSerifConfig () {
    return this.samsSerifConfig
  }
}
