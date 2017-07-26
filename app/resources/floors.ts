export const floorConfig = [
  { floorId: 31, floorName: 'B-1' },
  { floorId: 32, floorName: 'B-2' },
  { floorId: 33, floorName: 'B-3' },
  { floorId: 34, floorName: 'B-4' },
  { floorId: 35, floorName: 'B-5' },
  { floorId: 36, floorName: 'B-6' },
  { floorId: 61, floorName: 'B-7' },
]

declare global {
  interface NodeRequire {
    context: any
  }

  type Floor = Floor.Floor

  namespace Floor {
    type ColorName = string
    interface Floor {
      floorId: number
      regions: Region[]
      walls: Line[]
      nodes: Node[]
      config: {
        colors: { [colorName: string]: string }
        doorwidth: number
        wallwidth: number
      }
    }

    type Node = {
      id: number
      name: string
      type: string
      description: string
      labelConfig: {
        show: boolean
        pos: Point
        fontSize: number
      }
    }

    type Region = {
      id: number
      color: ColorName
      nodeId: number
      points: Point[]
    }

    type Wall = {
      id: number
      color: ColorName
      width: string
      line: Line
    }
  }
}


const requireFloor = require.context('../resources/', false, /floor-\d+\.json/)

const floors: Floor[] = []
requireFloor.keys().forEach((key: string) => {
  floors.push(requireFloor(key))
})

export default floors
