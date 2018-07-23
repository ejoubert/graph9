/*
Loads all composers from neo4j
*/

import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  model() {
    let query = 'match (n:Person) return distinct n order by n.Composer'
    return this.get('neo4j.session')
          .run(query)
          .then(function (result) {
            let nodes = []
            for (let i = 0; i < result.records.length; i++){
              let composer = {name: result.records[i].toObject().n.properties.Composer, id: result.records[i].toObject().n.identity.low}
              nodes.push(composer)
          }
          return nodes
        })
  }
});