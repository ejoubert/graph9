import Component from '@ember/component';
import { action } from '@ember/object'

export default class Toolbar extends Component {
  classNames = ['toolbar']
  isSearching = false

  @action
  search(query) {
    this.set('label', query.label)
    this.set('property', query.property)
    this.set('searchTerm', query.userInput)
    this.set('isSearching', false)
  }
}
