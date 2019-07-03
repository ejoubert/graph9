import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service(),

  
})
