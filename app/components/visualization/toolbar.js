import Component from '@ember/component';

export default Component.extend({
  classNames: ['toolbar'],
  isSearching: false,
  actions: {
    search(query) {
      this.set('label', query.label)
      this.set('property', query.property)
      this.set('searchTerm', query.userInput)
      this.set('isSearching', false)
    }
  }
})
