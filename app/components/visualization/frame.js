import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed, action } from '@ember/object'

export default class Frame extends Component {
  @service('cache') dataCache

  classNames = ['frame']

  @computed('items.[]', 'items.@each.properties')
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
  }

  @action
  hoveringOverNode(node) {
    this.set('nodeBeingHoveredOver', node)
  }

  @action
  clear() {
    this.clearCanvas()
  }

  @action
  undo() {
    this.undoLoad()
  }

  @action
  clickedSVG() {
    // this.set('currentlySelectedNode', null)
    // ! action is bubbling from graph component
    // I want this to close the editing window when the canvas is clicked, but not when a node is clicked.
  }

  @action
  doubleClickedSVG() {
    this.dataCache.createNode()
      .then(node => {
        this.items.addObject(node)
        this.loadedIds.pushObject(node.id)
      })
  }

  @action
  saveNode(node, changes, originalNode) {
    this.dataCache.saveNode(node, changes, originalNode)
    // properties are in the changes obj
    // labels have been changed directly on the node
  }

  @action
  deleteNode(node) {
    this.set('currentlySelectedNode', false)
    this.dataCache.deleteNode(node)
    this.items.removeObject(node)
  }
}
