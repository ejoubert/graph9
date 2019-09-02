import Controller from '@ember/controller'
import { inject as service } from '@ember/service'
import { action } from '@ember/object'

export default class ApplicationController extends Controller {
  @service router
  @service('graph-data-cache') graphCache

  projectName = 'Graph9'

  @action
  logout() {
    this.router.transitionTo('login')
    this.graphCache.empty()
    this.set('login', false)
  }
}
