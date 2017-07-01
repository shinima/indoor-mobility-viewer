export const floorConfig = [
  { floorId: 31, name: 'B-1' },
  { floorId: 32, name: 'B-2' },
  { floorId: 33, name: 'B-3' },
  { floorId: 34, name: 'B-4' },
  { floorId: 35, name: 'B-5' },
  { floorId: 36, name: 'B-6' },
  { floorId: 61, name: 'B-7' },
]

const requireFloor = require.context('../resources/', false, /floor-\d+\.json/)

const floors = []
requireFloor.keys().forEach((key) => {
  floors.push(requireFloor(key))
})

export default floors
