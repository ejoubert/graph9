import Component from '@ember/component';
import $ from 'jquery'
import d3 from 'd3'

export default Component.extend({
  classNames: 'graph',
  didUpdateAttrs() {
    console.log('update');
    this.createGraph()
  },

  didInsertElement() {
    console.log('starting to load')
    this.createGraph()
  },


  createGraph() {
    // let el = document.getElementById('graph')
    // console.log(el.getBoundingClientRect())
    let bounding = document.getElementsByClassName('frame')[0].getBoundingClientRect()
    let width = bounding.width
    let height = bounding.height
    this.set('svg', d3.select('svg')
      .attr('width', '100%')
      .attr('height', height)
    )

    this.svg.selectAll("g").remove()

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
        this.simulation.alphaTarget(0.7).restart()
        node.fx = d3.event.x
        node.fy = d3.event.y
      })
      .on('end', node => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0)
        }
        node.fx = null
        node.fy = null
      })
    )

    this.set('simulation', d3
      .forceSimulation()
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(node => node.radius))
      .force('link', this.linkForce)
      .force('x', d3.forceX())
      .force('y', d3.forceY())
    )
    this.draw()
  },

  draw() {
    this.svg.selectAll("g").remove()
    let data = this.nodes

    let nodes = data.filter(item => item.isNode)
    let links = data.filter(item => !item.isNode)

    var linkElements = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'black')

    var nodeElements = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', node => node.color)
      .on('mouseenter', (node) => this.hoveringOverNode(node))
      .on('click', node => this.clickedNode(node))
      .on('dblclick', node => this.doubleClickedNode(node))
      .call(this.dragDrop)

    var textElements = this.svg.append('g')
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

    zoom_handler(this.svg)

    function zoom_actions() {
      nodeElements.attr("transform", d3.event.transform)
      textElements.attr("transform", d3.event.transform)
      linkElements.attr("transform", d3.event.transform)
    }
    // nodeElements.attr("transform", d3.zoomIdentity)

    // var fbundling = d3.ForceEdgeBundling()
    //     .nodes(this.simulation.nodes())
    //     .edges(this.simulation.force('link').links().map(edge => {
    //         return {
    //             source: this.simulation.nodes().indexOf(edge.source),
    //             target: this.simulation.nodes().indexOf(edge.target)
    //         }
    //     }));

    // var link = links.selectAll('path')
    //     .data(fbundling());

    // link.exit().remove();
    // link.merge(link.enter().append('path'))
    //     .attr('d', d3line);

    this.simulation.nodes(nodes).on('tick', () => {

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

      this.simulation.force('link').links(links)
    })
    // this.simulation.restart()
  }
});
