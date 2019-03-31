import Component from '@ember/component';
import { computed } from '@ember/object'
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  groupedNodes: computed('items', 'items.[]', 'items.length', 'items.@each', function () {
    let data = {
      nodes: [],
      links: []
    }

    let items = this.items.uniqBy('id')

    items.forEach(item => {
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
      this.set('currentlySelectedNode', node)
    },

    doubleClickedNode(node) {
      if (!this.loaded.includes(node.id)) {
        this.loaded.pushObject(node.id)
        this.graphCache.loadConnections(node.id).then(nodes => {
          nodes.forEach(node => {
          })
        })
      }
    },

    hoveringOverNode(node) {
      console.log('hovering', node)
    }
  }
});
