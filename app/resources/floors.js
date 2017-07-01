export const floorConfig = [
  { floorId: 31, floorName: 'B-1' },
  { floorId: 32, floorName: 'B-2' },
  { floorId: 33, floorName: 'B-3' },
  { floorId: 34, floorName: 'B-4' },
  { floorId: 35, floorName: 'B-5' },
  { floorId: 36, floorName: 'B-6' },
  { floorId: 61, floorName: 'B-7' },
]

const requireFloor = require.context('../resources/', false, /floor-\d+\.json/)

const floors = []
requireFloor.keys().forEach((key) => {
  floors.push(requireFloor(key))
})

export default floors
