import Component from '@ember/component'
import d3 from 'd3'

export default class Graph extends Component {
  classNames = ['force-graph']

  didInsertElement() {
    this.initiateGraph()
    // window.addEventListener('resize', this.updateGraph)
    // document.addEventListener('resize', () => this.updateGraph())
    // $(window).on('resize', () => this.updateGraph())
    // document.addEventListener('resize', () => this.handleMouseLeave())
    this.set('currentScale', 1)
    this.set('currentXOffset', 0)
    this.set('currentYOffset', 0)
  }

  willDestroyElement() {
    // window.removeEventListener('resize', this.updateGraph)
  }

  didUpdateAttrs() {
    this.set('currentScale', 1)
    this.updateGraph()
  }

  /*
  //* Creates the svg with disabled double click zoom
  */

  initiateGraph() {
    let boundingBox = document.getElementsByClassName('frame')[0].getBoundingClientRect()
    this.set('height', boundingBox.height)
    this.set('width', boundingBox.width * (8 / 12))
    this.set('svg', d3.select('svg')
      .attr('height', this.height)
      .attr('width', this.width)
      .on('click', () => this.clickedSVG())
      .on('dblclick', () => this.doubleClickedSVG())
    )

    this.svg
      .call(d3.zoom()
        .on('zoom', () => this.zoomHandler())
        .extent([[0, 0], [this.width, this.height]])
        .scaleExtent([0.1, 2.5])
      )

    this.updateGraph()
  }

  zoomHandler() {
    if (d3.event.sourceEvent) {
      this.svg.selectAll('g').attr('transform', d3.event.transform)
      this.set('currentScale', d3.event.transform.k)
      this.set('currentXOffset', d3.event.transform.x)
      this.set('currentYOffset', d3.event.transform.y)
    }
  }

  updateGraph() {
    let nodeRadius = 25

    this.svg.selectAll('g')
      .exit().remove()

    this.set('linkForce', d3.forceLink()
      .id(link => link)
    )

    this.set('simulation', d3.forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody().strength(-1500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(this.links).id(d => d.id))
      .force("x", d3.forceX())
      .force("y", d3.forceY()))

    this.svg.selectAll('g').remove()


    let link = this.svg.append('g').attr('class', 'links').selectAll('.link')
    let node = this.svg.append('g').attr('class', 'nodes').selectAll('.node')
    let label = this.svg.append('g').attr('class', 'labels').selectAll('.label')


    let ticked = () => {

      node.attr('cx', d => d.x)
        .attr('cy', d => d.y)


      label.attr('x', d => d.x)
        .attr('y', d => d.y + nodeRadius + 16)

      link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      /* Nodes cannot leave the viewport */
      // node.attr('cx', d => Math.max(nodeRadius, Math.min((this.width / this.currentScale) - nodeRadius, d.x)))
      //   .attr('cy', d => Math.max(nodeRadius, Math.min((this.height / this.currentScale) - nodeRadius, d.y)))

      // label.attr('x', d => Math.max(nodeRadius, Math.min((this.width / this.currentScale) - nodeRadius, d.x)))
      //   .attr('y', d => Math.max(nodeRadius, Math.min((this.height / this.currentScale) - nodeRadius, d.y)))

      // link.attr('x1', d => Math.max(Math.min((this.width / this.currentScale) - nodeRadius, d.source.x)))
      //   .attr('y1', d => Math.max(Math.min((this.height / this.currentScale) - nodeRadius, d.source.y)))
      //   .attr('x2', d => Math.max(Math.min((this.width / this.currentScale) - nodeRadius, d.target.x)))
      //   .attr('y2', d => Math.max(Math.min((this.height / this.currentScale) - nodeRadius, d.target.y)))
    }

    let forceGraphUpdate = () => {
      node = node.data(this.nodes);
      node.exit().transition()
        .attr("r", 0)
        .remove();

      node = node.enter().append("circle")
        .on('dblclick', n => this.dblClicked(n, d3.event))
        .on('click', n => this.clicked(n))
        .merge(node)
        .attr("fill", n => n.color)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.25)

        .call(n => n.transition().attr("r", nodeRadius))
        .call(d3.drag()
          .on("start", n => this.dragStart(n))
          .on("drag", n => this.dragging(n))
          .on("end", n => this.dragEnd(n)))

      label = label.data(this.nodes)
      label.exit().transition()
        .remove()

      label = label.enter().append('text')
        .text(d => `${d.name.substring(0, 25)}${d.name.length > 24 ? '...' : ''}`)
        .attr('fill', 'black')

      link = link.data(this.links);

      link.exit().transition()

        .attrTween("x1", d => d.source.x)
        .attrTween("x2", d => d.target.x)
        .attrTween("y1", d => d.source.y)
        .attrTween("y2", d => d.target.y)
        .remove();

      link = link.enter().append("line")
        .attr('stroke', 'black')
        .attr("stroke-width", 1.5)

        .merge(link);

      this.simulation
        .nodes(this.nodes)
        .on("tick", ticked)
        .force("link", d3.forceLink(this.links).id(d => d.id))
        .restart()
    }
    forceGraphUpdate();
  }

  dragStart(node) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  }

  dragging(node) {
    node.fx = d3.event.x;
    node.fy = d3.event.y;
  }

  dragEnd(node) {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    node.fx = node.x;
    node.fy = node.y;
    // these can be set to null if we don't want to keep them pinned
  }

  dblClicked(node, evt) {
    evt.stopPropagation()
    console.log('double clicked', node);
    this.doubleClickedNode(node)
  }

  clicked(node) {
    console.log('clicked', node)
    this.clickedNode(node)
  }
}
