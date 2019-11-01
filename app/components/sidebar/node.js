import Component from '@ember/component';
import { action, computed } from '@ember/object'

export default class SideBarNode extends Component {
  classNames = ['node-base']

  addingNewProperty = false

  @computed('changes.properties.{keys,values}', 'changes.propertiesToDelete', 'addingNewProperty')
  get showSaveReminder() {
    return this.addingNewProperty || ('key' in this.changes.properties.keys) || this.changes.propertiesToDelete.length > 0 || this.originalNode.labels.length !== this.node.labels.length
  }

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
