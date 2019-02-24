import Component from '@ember/component'
import d3 from 'd3'
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  didUpdateAttrs() {
    this.drawNodes()
  },

  actions: {
    draw() {
      // this.drawNodes()
    }

  },

  drawNodes() {
    let circleRadius = 30 // Changes the size of each node
    let linkStrength = 0.025 // Higher is stronger.
    let nodes = this.nodes
    let links = this.links
    console.log(this.links)
  }

})
