/*
Has the save, edit, and toggle performances actions, as well as the ability to set source and destination.
*/

import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  rb: service('relationship-builder'),
  showPerformances: false,
  hovering: false,
  actions: {
    togglePerfs() {
        this.toggleProperty('showPerformances')  
    },
    editName() {
      this.toggleProperty('beingEdited')
    },
    save() {
      this.toggleProperty('beingEdited');      
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