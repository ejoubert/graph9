import Component from '@ember/component'
import { inject as service } from '@ember/service'
import d3 from 'd3'

export default Component.extend({

  graphCache: service('graph-data-cache'),

  willRender() {
    if (this.nodes.nodes.length) {
      this.drawNodes(this.nodes)
    }
  },

  drawNodes: function (data) {

    let width = document.getElementById('graph').getBoundingClientRect().width
    let height = document.getElementById('graph').getBoundingClientRect().height

    let nodes = data.nodes
    let links = data.links ? data.links : []

    let svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height);

    let circleRadius = 10 // Changes the size of each node
    let linkStrength = -20 // Higher is stronger.


    let simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id(function (d) {
          return d.id;
        }))
      .force('charge', d3.forceManyBody().strength(linkStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceCollide())
      .force('collision', d3.forceCollide().radius(function (d) { 25 }))
    simulation.nodes(nodes).on('tick', ticked);

    function updateLinks() {
      let link = d3.select('.links')
        .selectAll('g')
        .data(links)

      link.enter()
        .append('line')
        .merge(link)
        .attr('x1', function (d) {
          console.log(d.source.x)
          return d.source.x
        })
        .attr('y1', function (d) {
          console.log(d.source.y)
          return d.source.y
        })
        .attr('x2', function (d) {
          console.log(d.source.x)
          return d.target.x
        })
        .attr('y2', function (d) {
          console.log(d.source.y)
          return d.target.y
        })
        .attr('stroke', 'blue')
        .attr('stroke-width', '1')

      link.exit().remove()
    }

    function updateNodes() {
      let node = d3.select('.nodes')
        .selectAll('g')
        .data(nodes)

      node.enter()
        .append('circle')
        .merge(node)
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })
        .attr('r', circleRadius)
        .attr('fill', 'green')

        .on('click', ((d) => {
          debugger
          this.clickedNode(d)
          console.log(d)
        }))
        .on('mousemove', function(d) {
          // debugger
          this.style.fill = 'red'
          console.log(this)
        })
      node.exit().remove()
    }

    function ticked() {
      updateLinks()
      updateNodes()
    }
  }
})
