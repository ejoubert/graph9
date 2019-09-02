import Controller from '@ember/controller'
import { inject as service } from '@ember/service'
import { action } from '@ember/object'

export default class WelcomeController extends Controller {
  @service router

  @action
  login() {
    this.router.transitionTo('login')
  }
}
