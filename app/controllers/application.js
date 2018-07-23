/*
Holds the actions for submitting a relationship in the modal. Also holds options for the relationship selector dropdown.
*/

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  projectName: 'Visualizing Operatic Fame',
  rb: service('relationship-builder'),
  neo4j: service('neo4j-connection'),
  types: ['Performance_Of', 'Performed_By', 'Performed_In', 'References', 'Wrote'],
  choice: 'Choose a Relationship Type...',

  actions: {
    submit(source, destination) {
      console.log('relationship type: ' + this.get('choice'))
      console.log('source: ' + source)
      console.log('destination: ' + destination)
      this.get('rb').set('showModal', false)
      let query = 'MATCH(n),(m) WHERE id(n) ='+source+' AND id(m) ='+destination+' MERGE (n)-[:'+this.get('choice')+']->(m)'
      return this.get('neo4j.session')
      .run(query)
      .then(function (result) {
        console.log(result)
      })
    },
    chooseType(type) {
      this.set('choice', type)
    }
  }
});