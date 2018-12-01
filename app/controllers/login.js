import Controller from '@ember/controller'
import { inject as service } from '@ember/service'
import md5 from 'md5'

export default Controller.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),
  neo4j: service('neo4j-connection'),

  connection: null,
  neo4jUser: null,
  neo4jPass: null,
  user: null,

  init () {
    this._super(...arguments)
    if (localStorage.connection !== undefined) {
      this.set('connection', localStorage.connection)
    }
    if (localStorage.neo4jUser !== undefined) {
      this.set('neo4jUser', localStorage.neo4jUser)
    }
    if (localStorage.neo4jPass !== undefined) {
      this.set('neo4jPass', localStorage.neo4jPass)
    }
    if (localStorage.user !== undefined) {
      this.set('user', localStorage.user)
    }
  },

  actions: {
    submit (loginDetails) {
      localStorage.setItem('connection', loginDetails.connection)
      localStorage.setItem('neo4jUser', loginDetails.neo4jUser)
      localStorage.setItem('neo4jPass', loginDetails.neo4jPass)
      localStorage.setItem('user', loginDetails.user)
      localStorage.setItem('password', md5(loginDetails.password))

      this.neo4j.connect()

      this.graphCache.login(loginDetails).then((result) => {
        // We have connected to neo4j, but we may (or may not) have a wrong origin username/password
        if (!result) {
          this.set('incorrectLogin', false)
          this.set('incorrectConnection', false)
          this.router.transitionTo('visualization')
        } else {
          this.set('incorrectLogin', true)
          this.set('incorrectConnection', false)
        }
      }, () => {
        // We have failed to connect to neo4j
        this.set('incorrectLogin', false)
        this.set('incorrectConnection', true)
      })
    }
  }
})
