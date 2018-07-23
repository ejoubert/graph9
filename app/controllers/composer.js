import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  neo4j: service('neo4j-connection'),
  actions: {
    save() {      
      let query = 'match(n) where id(n)='+this.get('model.firstObject.composer_id')+' set n.Composer ="'+this.get('model.firstObject.composer')+'"'
      return this.get('neo4j.session')
      .run(query)
      .then(function (result) {
      })
    }
  }
});