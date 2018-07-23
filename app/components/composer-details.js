/*
Holds the events for mouseEnter, mouseLeave; actions for save, edit, set as source, and set as destination. The hovering state for the component is held and updated here.
*/

import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  rb: service('relationship-builder'),
  hovering: false,
  actions: {
    editName() {
      this.toggleProperty('beingEdited')
    },
    save() {
      this.toggleProperty('beingEdited');
      this.get('taskToDo')();
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
