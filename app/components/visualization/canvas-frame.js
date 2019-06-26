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
      // if (!this.loaded.includes(node.id)) {
      //   this.loaded.pushObject(node.id)
      // }
      let newNodes = this.graphCache.loadConnections(node.id)
      this.items.push([...newNodes])
      console.log(newNodes)
      console.log(this.items)
      // debugger
    },

    hoveringOverNode(node) {
      this.set('nodeBeingHoveredOver', node)
    }
  }
});
