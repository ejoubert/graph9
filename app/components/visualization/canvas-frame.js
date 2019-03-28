import Component from '@ember/component';
import { computed } from '@ember/object'

export default Component.extend({


  nodes: computed('items.[]', function () {
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
      console.log('clicked node in canvas-frame');
      console.log(node)
      this.set('currentlySelectedNode', node)
    }
  }
});
