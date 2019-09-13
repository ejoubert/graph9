import Component from '@ember/component';
import { action } from '@ember/object'

export default class NodeBase extends Component {
  classNames = ['node-base']

  addingNewProperty = false

  changes = {
    properties: {
      keys: {
      },
      values: {
      }
    }
  }

  didInsertElement() {
    if (this.node) {
      this.set('originalNode', JSON.parse(JSON.stringify(this.node)))
    }
  }

  @action
  save() {
    this.saveNode(this.node, this.changes, this.originalNode)
  }
}
