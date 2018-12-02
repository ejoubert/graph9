import Service from '@ember/service'

export default Service.extend({
  source: null,
  destination: null,
  relationshipType: null,
  settingDestination: false,
  showModal: null,
  init () {
    this._super(...arguments)
    this.set('settingDestination', false)
  },
  setSource (sourceId) {
    this.set('source', sourceId)
    this.set('settingDestination', true)
    this.set('showModal', false)
  },
  setDestination (destinationId) {
    this.set('destination', destinationId)
    this.set('settingDestination', false)
    this.set('showModal', true)
  },
  setRelationshipType (relationshipType) {
    this.relationshipType.pushObject(relationshipType)
  }
})
