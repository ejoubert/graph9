import Route from '@ember/routing/route'

export default Route.extend({

  beforeModel () {
    this.get('router').transitionTo('welcome')
  }
})
