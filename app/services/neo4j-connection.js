import Service from '@ember/service';
import neo4j from 'npm:neo4j-driver';

export default Service.extend({
  session: null,
  init () {
    this._super(...arguments)
    this.connect()
  },
  
  connect() {
    try {
      var driver = neo4j.v1.driver(localStorage.connection, neo4j.v1.auth.basic(localStorage.neo4jUser, localStorage.neo4jPass), {encrypted: true, trust: "TRUST_CUSTOM_CA_SIGNED_CERTIFICATES"});
      this.set('session', driver.session())
    }
    catch(err) {
    }
  }
});