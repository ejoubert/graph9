import Component from '@ember/component';
import d3 from 'd3'

export default Component.extend({
  classNames: ['graph'],

  didUpdateAttrs() {
    this.createGraph()
  },

  didInsertElement() {
    this.createGraph()
  },

  createGraph() {

    // svg.selectAll("g").remove()

    let boundingBox = document.getElementsByClassName('graph')[0].getBoundingClientRect()
    let width = boundingBox.width
    let height = boundingBox.height

    // width = 800
    height = 500
    let svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height)

    svg.selectAll("g").remove()

    let circleRadius = 10 // Changes the size of each node
    let linkStrength = -20 // Higher is stronger.

    this.set('linkForce', d3
      .forceLink()
      .id(function (link) { return link.id })
    )

    this.set('dragDrop', d3.drag()
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
    )

    var simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(node => node.radius))
      .force('link', this.linkForce)
      .force('x', d3.forceX())
      .force('y', d3.forceY())

    var linkElements = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'black')

    var nodeElements = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', node => node.color)
      .on('mouseenter', (node) => this.hoveringOverNode(node))
      .on('click', node => this.clickedNode(node))
      .on('dblclick', node => this.doubleClickedNode(node))
      .call(this.dragDrop)

    var textElements = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(this.nodes)
      .enter().append('text')
      .text(node => node.name)
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)

    var zoom_handler = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 20])
      .on("zoom", zoom_actions)

    zoom_handler(svg)

    function zoom_actions() {
      nodeElements.attr("transform", d3.event.transform)
      textElements.attr("transform", d3.event.transform)
      linkElements.attr("transform", d3.event.transform)
    }

    simulation.nodes(this.nodes).on('tick', () => {

      nodeElements
        .attr('cx', node => node.x)
        .attr('cy', node => node.y)
      textElements
        .attr('x', node => node.x)
        .attr('y', node => node.y)
      linkElements
        .attr('x1', link => link.source.x)
        .attr('y1', link => link.source.y)
        .attr('x2', link => link.target.x)
        .attr('y2', link => link.target.y)

      simulation.force('link').links(this.links)
    })
  }
});
