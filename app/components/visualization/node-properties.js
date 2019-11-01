import Component from '@ember/component';
import { action } from '@ember/object'

export default class NodeProperties extends Component {
  isEditing = false

  @action
  editNode() {
    this.set('isEditing', true)
  }

  @action
  deleteNode() {
  }

  @action
  save(form) {
    this.set('isEditing', false)
  }
}
