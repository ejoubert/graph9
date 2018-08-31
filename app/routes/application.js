import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  graphCache: service('graph-data-cache'),
  
  beforeModel() {
    const graphCache = this.get('graphCache')
    graphCache.init()
    console.log(window.localStorage)
  },
});
