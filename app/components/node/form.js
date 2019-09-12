import Component from '@ember/component';
import { action, set } from '@ember/object'
import { alias } from '@ember/object/computed'

export default class NodeForm extends Component {
  isEditing = false

  @alias('node.labels')
  selectedLabels

  @action
  changePropertyKey(oldValue, newValue) {
    this.changes.properties.keys[oldValue] = [oldValue, newValue]
  }

  @action
  changePropertyValue(oldValue, key, newValue) {
    this.changes.properties.values[key] = [oldValue, newValue]
  }
};