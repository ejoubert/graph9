import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import { later } from '@ember/runloop'

export default class VisualizationRoute extends Route {
  @service('cache') dataCache
  @service router

  autoRefreshInSeconds = 60

  queryParams = {
    labels: {
      refreshModel: true
    },
    properties: {
      refreshModel: true
    },
    searchTerms: {
      refreshModel: true
    },
    loaded: {
      refreshModel: true
    },
    loadedIds: {
      refreshModel: false
    }
  }

  beforeModel() {
    this.dataCache.init()
  }

  async model(params) {
    let data = await this.dataCache.loadModel(params)
    later(this, () => {
      return this.model(params)
    }, (1000 * this.autoRefreshInSeconds))
    return data
  }

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('dataCache', this.dataCache)
  }
}
