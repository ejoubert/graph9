import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  // graphCache: service('graph-data-cache'),

  // init() {
  //   this._super(...arguments)
  //   this.set('labels', this.graphCache.getLabels())
  // },

  // actions: {
  //   editNode() {
  //     this.toggleProperty('isEditing')
  //   },
  //   saveNode(form) {
  //     console.log(form)
  //     this.toggleProperty('isEditing')
  //   },
  //   deleteNode() {
  //     this.toggleProperty('isDeleting')
  //   },
  //   createNewLabel(select, e) {
  //     if (e.keyCode === 13 && select.isOpen &&
  //       !select.highlighted) {

  //       let selected = this.selected;
  //       if (!selected.includes(select.searchText)) {
  //         this.options.pushObject(select.searchText);
  //         select.actions.choose(select.searchText);
  //       }
  //     }
  //   }
  // }
});
