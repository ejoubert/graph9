import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed, action } from '@ember/object'
import { alias } from '@ember/object/computed'

export default class Frame extends Component {
  @service('cache') dataCache
  @service('relationship-builder') rlb

  classNames = ['frame']

  isDrawingEdge = false

  @alias('rlb.sourceNode')
  sourceNode

  @alias('rlb.destinationNode')
  destinationNode

  @computed('items.[]', 'items.@each.properties')
  get nodes() {
    return (this.items || []).filter(n => n.isNode)
  }

  @computed('items.[]', 'items.@each.properties')
  get links() {
    return (this.items || []).filter(n => !n.isNode)
  }

  @action
  closeNodeViewer() {
    this.set('currentlySelectedNode', null)
  }

  @action
  toggleDrawMode() {
    this.rlb.toggleProperty('isDrawingEdge')
  }

  @action
  createRelationship(relLabel) {
    let relObj = {
      source: this.sourceNode.id,
      destination: this.destinationNode.id,
      relLabel
    }
    this.rlb.resetNodes()
    this.dataCache.createRelationship(relObj)
      .then(data => {
        this.items.addObject(data[0])
      })
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
