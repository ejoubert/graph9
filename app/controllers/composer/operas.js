import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  rb: service('relationship-builder'),
  actions: {
    setSource(sourceId) {
      this.get('rb').setSource(sourceId)
    },
    setDestination(destinationId) {
      this.get('rb').setDestination(destinationId)
    }
  }
});
