import Service from '@ember/service';
import neo4j from 'npm:neo4j-driver';

export default Service.extend({
  session: null,
  init() {
    this._super(...arguments);
    var driver = neo4j.v1.driver("bolt://localhost:7687", neo4j.v1.auth.basic("neo4j", "james"));
    this.set('session', driver.session())
  }
});