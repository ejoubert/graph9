import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object'
import { htmlSafe } from '@ember/template';


export default Component.extend({
  graphCache: service('graph-data-cache'),

  attributeBindings: ['style'],

  style: computed(function () {
    return htmlSafe('width: 75vw')
  }),

  labels: computed(function () {
    return this.graphCache.getLabels()
  }),

  properties: computed('selectedLabel', function () {
    return this.graphCache.getProperties(this.selectedLabel)
  }),

  actions: {
    search() {
      this.search({
        label: this.selectedLabel,
        property: this.selectedProperty,
        userInput: this.userSearchTerm
      })
    }
  }

})
