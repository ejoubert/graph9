import Component from '@ember/component';
import { action } from '@ember/object'

export default class Base extends Component {
  changes = {
    properties: {
      keys: {
      },
      values: {
      }
    }
  }

  didInsertElement() {
    this.set('changesetObj', new Object(this.node))
    this.set('originalNode', JSON.parse(JSON.stringify(this.node)))
  }

  @action
  save() {
    this.saveNode(this.node, this.changes, this.originalNode)
  }
}
