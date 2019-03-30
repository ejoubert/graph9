import Component from '@ember/component'
import { inject as service } from '@ember/service'
import d3 from 'd3'

export default Component.extend({

  graphCache: service('graph-data-cache'),

  didRender() {
    if (this.nodes.nodes.length) {
      this.drawNodes(this.nodes)
    }
  },

  drawNodes: function (data) {
    let width = document.getElementById('graph').getBoundingClientRect().width
    let height = document.getElementById('graph').getBoundingClientRect().height

    let nodes = data.nodes
    let links = data.links ? data.links : []

    let svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);

    let circleRadius = 10 // Changes the size of each node
    let linkStrength = -20 // Higher is stronger.

    var linkForce = d3
      .forceLink()
      .id(function (link) { return link.id })

    var simulation = d3
      .forceSimulation()
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', linkForce)

    var linkElements = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'black')

    var nodeElements = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', 'green')
      .on('mouseenter', (node) => { })
      .on('click', node => { this.clickedNode(node) })

    var textElements = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(function (node) { return node.name })
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)

    simulation.nodes(nodes).on('tick', () => {
      nodeElements
        .attr('cx', function (node) { return node.x })
        .attr('cy', function (node) { return node.y })
      textElements
        .attr('x', function (node) { return node.x })
        .attr('y', function (node) { return node.y })
      linkElements
        .attr('x1', function (link) { return link.source.x })
        .attr('y1', function (link) { return link.source.y })
        .attr('x2', function (link) { return link.target.x })
        .attr('y2', function (link) { return link.target.y })

      simulation.force('link').links(links)
    })
  }

})
