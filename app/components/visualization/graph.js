import Ember from 'ember';
import d3 from 'd3'

export default Ember.Component.extend({
  classNames: ['force-graph'],

  didInsertElement() {
    this.initiateGraph()
  },

  didUpdateAttrs() {
    this.updateGraph()
  },

  initiateGraph() {
    this.set('height', 1000)
    this.set('width', 800)
    this.set('svg', d3.select('svg')
      .attr('height', this.height)
      .attr('width', this.width)
    )
    this.updateGraph()
    this.svg
      .call(d3.zoom).on('dblclick', () => null)
  },

  updateGraph() {
    this.set('linkForce', d3.forceLink()
      .id(link => link)
    )

    this.set('simulation', d3.forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(this.links).id(d => d.id))
      .force("x", d3.forceX())
      .force("y", d3.forceY()))

    let link = this.svg.append('g').attr('class', 'links').selectAll('.link')
    let node = this.svg.append('g').attr('class', 'nodes').selectAll('.node')

    let ticked = () => {
      node.attr('cx', d => d.x)
        .attr('cy', d => d.y)

      link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    }

    let forceGraphUpdate = () => {

      node = node.data(this.nodes);
      node.exit().transition().attr("r", 0)
        .remove();

      node = node.enter().append("circle")
        .on('dblclick', n => this.dblClicked(n))
        .merge(node)
        .attr("fill", n => n.color)
        .call(n => n.transition().attr("r", 15))
        .call(d3.drag()
          .on("start", n => this.dragStart(n))
          .on("drag", n => this.dragging(n))
          .on("end", n => this.dragEnd(n)))

      link = link.data(this.links);

      link.exit().transition()

        .attrTween("x1", d => d.source.x)
        .attrTween("x2", d => d.target.x)
        .attrTween("y1", d => d.source.y)
        .attrTween("y2", d => d.target.y)
        .remove();

      link = link.enter().append("line")
        .attr('stroke', 'black')
        .attr("stroke-opacity", 1.5)
        .merge(link);

      this.simulation
        .nodes(this.nodes)
        .on("tick", ticked)
        .force("link", d3.forceLink(this.links).id(d => d.id))
      this.simulation.restart()
    }
    forceGraphUpdate();
  },

  dragStart(node) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  },

  dragging(node) {
    node.fx = d3.event.x;
    node.fy = d3.event.y;
  },

  dragEnd(node) {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  },

  dblClicked(node) {
    console.log('clicked', node);
    this.doubleClickedNode(node)
  }
})
