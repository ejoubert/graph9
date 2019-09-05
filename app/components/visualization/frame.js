import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed, action } from '@ember/object'

export default class Frame extends Component {
  @service('cache') dataCache

  classNames = ['frame']

  @computed('items.[]')
  get nodes() {
    return (this.items || []).filter(n => n.isNode).uniqBy('id')
  }

  @computed('items.[]')
  get links() {
    return (this.items || []).filter(n => !n.isNode).uniqBy('id')
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
  clickedSVG() {
    // this.set('currentlySelectedNode', null)
    // ! action is bubbling from graph component
    // I want this to close the editing window when the canvas is clicked, but not when a node is clicked.
  }
}
