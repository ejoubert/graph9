import Component from '@ember/component';
import { computed } from '@ember/object'

export default Component.extend({

  groupedNodes: computed('items', 'items.[]', 'items.length', 'items.@each', function () {
    let data = {
      nodes: [],
      links: []
    }

    this.items.forEach(item => {
      if (item.isNode) {
        data.nodes.push(item)
      } else {
        data.links.push(item)
      }
    })
    return data
  }),

  actions: {
    clickedNode(node) {
      console.log(this.loaded)
      this.loaded.push(node.id)
      // this.set('loaded', node.id)
      this.set('start', node.id)
      console.log('clicked node in canvas-frame');
      console.log(node)
      this.set('currentlySelectedNode', node)
    }
  }
});
