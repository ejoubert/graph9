import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    clickedNode(node) {
      this.set('currentlySelectedNode', node)
    },

    doubleClickedNode(node) {
      this.loaded.addObject(node.id)
      this.graphCache.loadConnections(node.id)
      .then(nodes => {
        nodes.forEach(node => {
          this.items.pushObject(node)
        })
      })
    },

    hoveringOverNode(node) {
      this.set('nodeBeingHoveredOver', node)
    }
  }
});
