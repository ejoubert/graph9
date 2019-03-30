import Component from '@ember/component';

export default Component.extend({
  isEditing: false,

  actions: {
    editNode() {
      this.set('isEditing', true)
    },

    deleteNode() {
    },

    save(form) {
      this.set('isEditing', false)
    }
  }
});
