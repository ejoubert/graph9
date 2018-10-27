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
    submit(loginDetails) {
      this.get('graphCache').empty()
      if (loginDetails.bolt.substring(0,7) !== 'bolt://') {
        loginDetails.bolt = "bolt://"+loginDetails.bolt
      }
      localStorage.setItem('connection', loginDetails.bolt)
      localStorage.setItem('neo4jUser', loginDetails.neo4jUser)
      localStorage.setItem('neo4jPass', loginDetails.neo4jPass)
      localStorage.setItem('user', loginDetails.user)
      localStorage.setItem('password', md5(loginDetails.password))

      this.set('bolt', loginDetails.bolt)
      this.set('neo4jUser', loginDetails.neo4jUser)
      this.set('user', loginDetails.user)

      this.get('router').transitionTo('visualization')
    }
  }
});
