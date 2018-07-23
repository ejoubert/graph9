import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  model() {
    let query = 'match (n:Person)-[r]-(m:Ideal_Opera) return distinct n,m,r limit 10'
    return this.get('neo4j.session')
          .run(query)
          .then(function (result) {
            let nodes = []
            for (let i = 0; i < result.records.length; i++){
              let performance = {
                title: result.records[i].toObject().m.properties.Ideal_Opera,
                composer: result.records[i].toObject().n.properties.Composer,
                composer_id: result.records[i].toObject().n.identity.low,
                opera_id: result.records[i].toObject().m.identity.low,
              }
              nodes.push(performance)
            }
            let composers= [];
            for (var i = 0; i < nodes.length; i++) { 
              composers.push({
                composer: nodes[i].composer,
                composer_id: nodes[i].composer_id
              })
            }
            console.log({
              composers: composers.uniqBy('composer_id'),
              operas: nodes.uniqBy('opera_id')
            })
            return {
              composers: composers.uniqBy('composer_id'),
              operas: nodes.uniqBy('opera_id')
            }
          })
  }
});
