import Component from '@ember/component';
import { action } from '@ember/object'

export default class Toolbar extends Component {
  classNames = ['toolbar']
  isSearching = false

  @action
  search(query) {
    this.labels.pushObject(query.labels)
    this.properties.pushObject(query.properties)
    this.searchTerms.pushObject(query.userInput)
    this.set('isSearching', false)
  }
}
