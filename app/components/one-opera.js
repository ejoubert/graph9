/*
Has the save, edit, set source and destination actions, and mouseEnter and mouseLeave events.
*/

import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  rb: service('relationship-builder'),
  hovering: false,
  actions: {
    editOpera() {
      this.toggleProperty('beingEdited')
    },
    save() {
      this.toggleProperty('beingEdited')
    },
    setSource(sourceId) {
      this.get('rb').setSource(sourceId)
      
    },
    setDestination(destinationId) {
      this.get('rb').setDestination(destinationId)
    }
  },
  mouseEnter() {
      this.set('hovering', true)
    },
  mouseLeave() {
    this.set('hovering', false)
    }
});
