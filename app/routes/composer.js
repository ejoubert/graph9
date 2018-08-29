/*
Loads the model hook for a specific composer (params.composer_id)
*/

import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  model(params) {
    let query = 'match (n:Person)--(m:Ideal_Opera) where id(n)='+params.composer_id+' return distinct n,m'
    return this.get('neo4j.session')
          .run(query)
          .then(function (result) {
            let nodes = []
            for (let i = 0; i < result.records.length; i++){
              let performance = {
                title: result.records[i].toObject().m.properties.Ideal_Opera,
                composer: result.records[i].toObject().n.properties.Composer,
                composer_id: result.records[i].toObject().n.identity.low,
                opera_id: result.records[i].toObject().m.identity.low
              }
              nodes.push(performance)
          }
          return nodes
        })
  }
});



// Create a login page
//   enter username:paul and password:123
//   store username and password in localStorage
//   if username and password exists in localStorage, then user can move on to other routes

//   match (n:username = paul and password. = 123) + model


// MATCH (a:Origin)--(n:Ideal_Opera)--(m:Whatever)
// WHERE a.username=<username>
//   AND a.password=<password>
//   AND id(n)=789
// RETURN n, m


// Each root node has username password