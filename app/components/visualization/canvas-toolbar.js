import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    toggleSearchDialog() {
      this.toggleProperty('showPromptDialog')
    },

    search(query) {
      this.graphCache.search(query)
      this.send('toggleSearchDialog')
    }
  }
})
