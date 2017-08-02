import * as moment from 'moment'

const now = moment().startOf('day').valueOf()
const target = moment('2017-06-24').startOf('day').valueOf()
const diff = now - target

export default function getNow() {
  // const hour = moment().hours()
  // const minute = moment().minutes()
  // const second = moment().seconds()
  // return moment('2017-06-24').add(hour, 'hours').add(minute, 'minutes').add(second, 'seconds').valueOf()
  return moment().valueOf() - diff
}
