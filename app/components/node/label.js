import Component from '@ember/component';
import { computed } from '@ember/object'
import { alias } from '@ember/object/computed'
import {inject as service} from '@ember/service'

export default class Label extends Component {
@service('cache') dataCache

  tagName = 'svg'

  attributeBindings = ['height:height', 'width:width']

  height = 30
  width = 150
  textY = (this.height / 1.4)

  @alias('label')
  name

  @computed()
  get path() {
    let height = this.height
    let width = this.width
    let curveOffset = height / 2
    return `
      M ${curveOffset}, 0
      h ${width - (curveOffset * 2)}
      a ${curveOffset} ${curveOffset} 0 0 1 0 ${height}
      h -${width - (curveOffset * 2)}
      a ${curveOffset} ${curveOffset} 0 0 1 0 -${height}
    `
  }

  @computed('label')
  get color() {
    let foundColor = JSON.parse(localStorage.labelColours).find(lsc => lsc.label === this.name)
    return foundColor ? foundColor.colour : this.dataCache.getRandomColor()
  }
}
