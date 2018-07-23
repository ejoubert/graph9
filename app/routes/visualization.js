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
      let performance = []

 // If Person
      if (result.records[0].toObject()['n'].labels == 'Person') {
        console.log(result.records[0].toObject()['n'].labels.toString())
        for (let i = 0; i < result.records.length; i++){
          performance = {
            name: result.records[i].toObject().m.properties.Ideal_Opera,
            properties: result.records[i].toObject().n.properties,
          }
          nodes.push(performance)
          console.log(nodes)
        }
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


// Make a generic code that gathers all the information needed to display the node in vis.js and also be editable in it's node-view component.

    // Re-structure the final object so that each node has a node.name as well as a node.properties