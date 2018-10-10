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
    this.set('choices', 'Choose a Relationship Type...')
  },

  actions: {
    login() {
      this.get('router').transitionTo('login')
    },

    logout() {
      this.get('router').transitionTo('login')
      this.get('graphCache').empty()
    }
  }
});