import Component from '@ember/component'
import { computed } from '@ember/object'
import d3 from 'd3'

export default Component.extend({


  data: computed('items.[]', function () {

    // if (this.items.length) {
    //   function groupBy(list, keyGetter) {
    //     const map = new Map();
    //     list.forEach((item) => {
    //       const key = keyGetter(item);
    //       const collection = map.get(key);
    //       if (!collection) {
    //         map.set(key, [item]);
    //       } else {
    //         collection.push(item);
    //       }
    //     });
    //     return map;
    //   }
    //   let groupedItems = groupBy(this.items, item => item.isNode)

    //   let data = {
    //     nodes: groupedItems.get(true),
    //     links: groupedItems.get(false)
    //   }



    let data = {
      nodes: [
        { name: 'A' },
        { name: 'B' },
        { name: 'C' },
        { name: 'D' },
        { name: 'E' },
        { name: 'F' },
        { name: 'G' },
        { name: 'H' },
      ],
      links: [
        { source: 0, target: 1 },
        { source: 0, target: 2 },
        { source: 0, target: 3 },
        { source: 1, target: 6 },
        { source: 3, target: 4 },
        { source: 3, target: 7 },
        { source: 4, target: 5 },
        { source: 4, target: 7 }
      ]
    }

    drawNodes(data)

    function drawNodes(data) {
      let nodes = data.nodes
      let links = data.links
      var width = 800, height = 500

      /********************************** */

      var simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('link', d3.forceLink().links(links))
        .on('tick', ticked);

      function updateLinks() {
        var u = d3.select('.links')
          .selectAll('g')
          .data(links)

        u.enter()
          .append('line')
          .merge(u)
          .attr('x1', function (d) {
            return d.source.x
          })
          .attr('y1', function (d) {
            return d.source.y
          })
          .attr('x2', function (d) {
            return d.target.x
          })
          .attr('y2', function (d) {
            return d.target.y
          })
          .attr('stroke', 'red')
          .attr('stroke-width', '2')


        u.exit().remove()
      }

      function updateNodes() {
        var node = d3.select('.nodes')
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
          .attr('r', '5')
          .attr('color', 'black')
          .attr('fill', 'black')
        node.exit().remove()
      }

      function ticked() {
        updateLinks()
        updateNodes()
      }
    }
    // }
  })
})
