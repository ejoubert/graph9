import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    clickedNode(node) {
      this.set('currentlySelectedNode', node)
    },

    doubleClickedNode(node) {
      if (!this.loaded.includes(node.id)) {
        this.loaded.pushObject(node.id)
      }
    },

    hoveringOverNode(node) {
      this.set('nodeBeingHoveredOver', node)
    }
  }
});
