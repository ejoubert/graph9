import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import md5 from 'md5';

export default Controller.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),

  noLogin: false,
  bolt: null,
  neo4jUser: null,
  neo4jPass: null,
  user: null,

  init() {
    this._super(...arguments)
    if (localStorage.connection != undefined) {
      this.set('bolt', localStorage.connection)
      this.set('neo4jUser', localStorage.neo4jUser)
      this.set('neo4jPass', localStorage.neo4jPass)
      this.set('user', localStorage.user)
    }
  },

  actions: {
    submit(bolt, neo4jUser, neo4jPass, user, password) {

      localStorage.setItem('connection', bolt)
      localStorage.setItem('neo4jUser', neo4jUser)
      localStorage.setItem('neo4jPass', neo4jPass)
      localStorage.setItem('user', user)
      localStorage.setItem('password', md5(password))

      this.set('bolt', bolt)
      this.set('neo4jUser', neo4jUser)
      this.set('user', user)

      if (user == undefined || user == null || bolt == undefined || bolt == null || neo4jPass == undefined || neo4jPass == null || neo4jUser == undefined || neo4jUser == null) {
        console.log('Enter login credentials to continue.')
        this.set('noLogin', true)
      } else {
        this.get('router').transitionTo('visualization')
      }
    }
  }
});
