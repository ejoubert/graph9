import Component from '@ember/component'
import { inject as service } from '@ember/service'
import d3 from 'd3'

export default Component.extend({

  graphCache: service('graph-data-cache'),

  didInsertElement() {
    if (this.nodes.length) {
      this.drawNodes(this.nodes)
    }
  },

  drawNodes: function (data) {
    let width = document.getElementById('graph').getBoundingClientRect().width
    let height = document.getElementById('graph').getBoundingClientRect().height

    let nodes = data.filter(item => item.isNode)
    let links = data.filter(item => !item.isNode)

    let svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);

    let circleRadius = 10 // Changes the size of each node
    let linkStrength = -20 // Higher is stronger.

    var linkForce = d3
      .forceLink()
      .id(function (link) { return link.id })

    var dragDrop = d3.drag()
      .on('start', node => {
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', node => {
        simulation.alphaTarget(0.7).restart()
        node.fx = d3.event.x
        node.fy = d3.event.y
      })
      .on('end', node => {
        if (!d3.event.active) {
          simulation.alphaTarget(0)
        }
        node.fx = null
        node.fy = null
      })

    var simulation = d3
      .forceSimulation()
      .force('charge', d3.forceManyBody().strength(-20))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(node => node.radius))
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
      .attr('fill', node => node.color)
      .on('mouseenter', (node) => { this.hoveringOverNode(node) })
      .on('click', node => { this.clickedNode(node) })
      .on('dblclick', node => { this.doubleClickedNode(node) })
      .call(dragDrop)

    var textElements = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(node => node.name)
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)

      var zoom_handler = d3.zoom()
      .on("zoom", zoom_actions)

    zoom_handler(svg)

    function zoom_actions(){
      nodeElements.attr("transform", d3.event.transform)
      textElements.attr("transform", d3.event.transform)
      linkElements.attr("transform", d3.event.transform)
  }

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