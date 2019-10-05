import Component from '@ember/component';
import { computed, action, set } from '@ember/object'
import { alias } from '@ember/object/computed'

export default class NodeForm extends Component {

  newPropertyKey = ''
  newPropertyValue = ''

  @alias('node.labels')
  selectedLabels

  @computed('node.properties.@each', 'changes.properties.{keys,values}', 'redraw')
  get properties() {
    return this.node.properties
  }

  @action
  changePropertyKey(oldValue, newValue) {
    this.changes.properties.keys[oldValue] = [oldValue, newValue]
  }

  @action
  changePropertyValue(oldValue, key, newValue) {
    this.changes.properties.values[key] = [oldValue, newValue]
  }

  @action
  focusOutProperty() {
    this.canFinishAddingNewProperty()
  }

  @action
  createNewLabel(newLabel) {
    let formattedLabel = newLabel.replace(/[^a-zA-Z]/g, '_')
    this.selectedLabels.pushObject(formattedLabel)
  }

  canFinishAddingNewProperty() {
    if (this.newPropertyKey !== '' && this.newPropertyValue !== '') {
      this.changes.properties.values[this.newPropertyKey] = [this.newPropertyValue, this.newPropertyValue]
      let oldProps = this.node.properties
      oldProps[this.newPropertyKey] = this.newPropertyValue
      set(this.node, 'properties', oldProps)
      this.toggleProperty('redraw')
      this.set('addingNewProperty', false)
      this.setProperties({
        newPropertyKey: '',
        newPropertyValue: ''
      })
    }
  }
};