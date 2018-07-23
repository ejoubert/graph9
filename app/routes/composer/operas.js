/*
Loads the model hook for a composer's operas
*/


import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  model(params) {
    let query = 'match (n:Ideal_Opera)--(m:Opera_Performance)--(b:Troupe), (m:Opera_Performance)--(v:Place) where id(n)='+params.opera_id+' return distinct m,b,v order by m.Date'
    return this.get('neo4j.session')
          .run(query)
          .then(function (result) {
            let nodes = []
            for (let i = 0; i < result.records.length; i++){
              let performance = {
                title: result.records[i].toObject().m.properties.Original_Title,
                date: result.records[i].toObject().m.properties.Date,
                id: result.records[i].toObject().m.identity.low,
                troupe: result.records[i].toObject().b.properties.Troupe,
                place: result.records[i].toObject().v.properties.City
              }
              nodes.push(performance)
            }
          return nodes
          })
    }
});