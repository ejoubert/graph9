import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed, action } from '@ember/object'
import { htmlSafe } from '@ember/template';


export default class Querier extends Component {
  @service('graph-data-cache') graphCache

  classNames = ['query-builder']

  attributeBindings = ['style']

  style = htmlSafe('width: 100%')

  labels = []

  didInsertElement() {
    this.getUpdatedLabels()
  }

  didUpdateAttrs() {
    this.getUpdatedLabels()
  }

  getUpdatedLabels() {
    this.set('labels', this.graphCache.getLabels())
  }

  @computed('selectedLabel')
  get properties() {
    return this.graphCache.getProperties(this.selectedLabel)
  }

  @action
  submitQuery() {
    this.search({
      labels: this.selectedLabel,
      properties: this.selectedProperty,
      userInput: this.userSearchTerm
    })
  }
}
