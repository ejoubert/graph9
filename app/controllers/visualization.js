import Controller from '@ember/controller'

export default Controller.extend({

  actions: {
    showGuide () {
      this.set('showGuide', true)
    },

    closeModal () {
      this.set('showGuide', false)
    }
  }
})
