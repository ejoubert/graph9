import Component from '@ember/component'

export default Component.extend({
  labelTypes: null,
  labelChoice: 'Label one',

  init () {
    this._super(...arguments)
    this.set('labelTypes', ['Label one', 'Label two', 'Label three'])
  },

  actions: {
    chooseLabel (label) {
      this.set('labelChoice', label)
    },

    toggleEditing () {
      this.toggleProperty('isEditing')
    }
  }
})
