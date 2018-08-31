/*
Holds the actions for submitting a relationship in the modal. Also holds options for the relationship selector dropdown.
*/

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  router: service('router'),
  

  projectName: null,
  neo4j: null,
  types: null,
  choice: null,
  login: false,


  init(){
    this._super(...arguments)
    this.set('projectName', 'Graph9')
    this.set('neo4j', service('neo4j-connection'))
    this.set('types', ['CELEBRATES','COMPOSED','CONTAINS','CRITIQUED','ORIGIN','PERFORMANCE_OF','PERFORMED','PERFORMED_IN','PRODUCED','REFERENCES','REVIEWS','WROTE','WROTE_TEXT'])
    this.set('choices', 'Choose a Relationship Type...')
  },

  actions: {
    login() {
      this.get('router').transitionTo('login')
    }
  }
});