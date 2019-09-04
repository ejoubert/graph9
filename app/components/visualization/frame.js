import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed, action } from '@ember/object'

export default class Frame extends Component {
  @service('graph-data-cache') graphCache

  classNames = ['frame']

  @computed('items.[]')
  get nodes() {
    return (this.items || []).filter(n => n.isNode)
  }

  @computed('items.[]')
  get links() {
    return (this.items || []).filter(n => !n.isNode)
  }

  @action
  clickedNode(node) {
    this.set('currentlySelectedNode', node)
  }

  @action
  doubleClickedNode(node) {
    this.loaded.addObject(node.id)
    this.graphCache.loadConnections(node.id)
      .then(nodes => {
        nodes.forEach(node => {
          this.items.pushObject(node)
        })
      })
  }

  @action
  hoveringOverNode(node) {
    this.set('nodeBeingHoveredOver', node)
  }

  @action
  clear() {
    this.clearCanvas()
  }

  click() {
    // this.set('currentlySelectedNode', null)
    // ! action is bubbling from graph component
    // I want this to close the editing window when the canvas is clicked, but not when a node is clicked.
  }
}
