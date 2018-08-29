import Service from '@ember/service';
import neo4j from 'npm:neo4j-driver';

export default Service.extend({
  session: null,
  init() {
    this._super(...arguments);
    var driver = neo4j.v1.driver(window.sessionStorage.connection, neo4j.v1.auth.basic(window.sessionStorage.neo4jUser, window.sessionStorage.neo4jPass));
    this.set('session', driver.session());
  }
});
