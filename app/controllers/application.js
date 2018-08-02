/*
Holds the actions for submitting a relationship in the modal. Also holds options for the relationship selector dropdown.
*/

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  projectName: 'Visualizing Operatic Fame',
  // rb: service('relationship-builder'),
  neo4j: service('neo4j-connection'),
  types: ['Performance_Of', 'Performed_By', 'Performed_In', 'References', 'Wrote'],
  choice: 'Choose a Relationship Type...',
});