import Controller from '@ember/controller'
import { action } from '@ember/object'

export default class VisualizationController extends Controller {
  classNames = ['visualization']
  queryParams = ['label', 'property', 'searchTerm', 'loaded']
  loaded = []
  label = null
  property = null
  searchTerm = null

  @action
  showGuide() {
    this.set('showGuide', true)
  }

  @action
  closeModal() {
    this.set('showGuide', false)
  }

  @action
  clearCanvas() {
    this.set('label', null)
    this.set('property', null)
    this.set('searchTerm', null)
    this.set('loaded', null)
  }
}
