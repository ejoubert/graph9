import Controller from '@ember/controller'

export default Controller.extend({
  classNames: ['vizualization'],
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
    },

    clearCanvas() {
      this.set('label', null)
      this.set('property', null)
      this.set('searchTerm', null)
      this.set('loaded', null)
    }
  }
})
