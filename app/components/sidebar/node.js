import Component from '@ember/component';
import { action } from '@ember/object'

export default class SideBarNode extends Component {
  classNames = ['node-base']

  addingNewProperty = false

  changes = {
    properties: {
      keys: {
      },
      values: {
      }
    },
    propertiesToDelete: []
  }

  didUpdateAttrs() {
    if (this.node) {
      this.createCarbonCopy()
    }
  }

  createCarbonCopy() {
    this.set('originalNode', JSON.parse(JSON.stringify(this.node)))
  }

  @action
  save() {
    this.saveNode(this.node, this.changes, this.originalNode)
    this.createCarbonCopy()
  }
}
