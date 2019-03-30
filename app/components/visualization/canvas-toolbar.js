import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    toggleSearchDialog() {
      this.toggleProperty('showPromptDialog')
    },

    search(query) {
      console.log(query)
      this.set('label', query.label)
      this.set('property', query.property)
      this.set('searchTerm', query.userInput)
      // this.set('start', {
      //   label: query.label,
      //   property: query.property,
      //   searchTerm: query.userInput
      // })
      // this.graphCache.search(query)
      this.send('toggleSearchDialog')
    }
  }
})
