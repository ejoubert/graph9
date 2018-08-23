import Service from '@ember/service';
import neo4j from 'npm:neo4j-driver';

export default Service.extend({
  session: null,
  init() {
    this._super(...arguments);
    let user = 'wallace_herman_lock_green'
    let password = 'LyEPLg7ygjoDrLxbAAhQSQ'
    // let password = 'james'
    // let user = 'neo4j'

    
    // var driver = neo4j.v1.driver("bolt://localhost:7687", neo4j.v1.auth.basic(user, password));
    var driver = neo4j.v1.driver("bolt://wallace-herman-lock-green.graphstory.services:7687", neo4j.v1.auth.basic(user, password))
    this.set('session', driver.session())
  }
});
