import Component from '@ember/component'
import { inject as service } from '@ember/service'
import { action } from '@ember/computed'

export default class AccountDropdown extends Component {
  @service router
  @service('cache') dataCache

  init() {
    this._super(...arguments)
    this.set('currentUser', localStorage.user)
    this.set('connection', localStorage.connection)
  }

  @action
  logout() {
    this.router.transitionTo('login')
    this.dataCache.empty()
    this.set('login', false)
  }
  @action
  goToGuide() {
    this.showGuide()
  }
}
