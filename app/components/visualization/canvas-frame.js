import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  classNames: 'frame',

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
  },

  click() {
    // this.set('currentlySelectedNode', null)
    // ! action is bubbling from graph component
    // I want this to close the editing window when the canvas is clicked, but not when a node is clicked.
  }
});
