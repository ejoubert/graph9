/*
Holds the actions for submitting a relationship in the modal. Also holds options for the relationship selector dropdown.
*/

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  projectName: null,
  neo4j: null,
  types: null,
  choice: null,



  init(){
    this._super(...arguments)
    this.set('projectName', 'Visualizing Operatic Fame')
    this.set('neo4j', service('neo4j-connection'))
    this.set('types', ['Performance_Of', 'Performed_By', 'Performed_In', 'References', 'Wrote'])
    this.set('choices', 'Choose a Relationship Type...')
  }
});