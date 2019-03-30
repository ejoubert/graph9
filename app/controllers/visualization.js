import Controller from '@ember/controller'

export default Controller.extend({
  queryParams: ['label', 'property', 'searchTerm', 'loaded'],
  loaded: [],
  label: null,
  property: null,
  searchTerm: null,

  actions: {
    showGuide () {
      this.set('showGuide', true)
    },

    closeModal () {
      this.set('showGuide', false)
    }
  }
})
