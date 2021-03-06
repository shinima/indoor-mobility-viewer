import { Line, Point } from '../interfaces'

declare global {
  interface NodeRequire {
    context: any
  }

  type Floor = Floor.Floor

  namespace Floor {
    type ColorName = string

    interface Floor {
      floorId: number
      buildingName: 'B'
      floorNumber: number
      regions: Region[]
      walls: Line[]
      nodes: Node[]
      doors: Door[]
      config: {
        colors: { [colorName: string]: string }
        doorwidth: number
        wallwidth: number
      }
    }

    interface Node {
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

    interface Region {
      id: number
      color: ColorName
      nodeId: number
      points: Point[]
    }

    interface Wall {
      id: number
      color: ColorName
      width: string
      line: Line
    }

    interface Door {
      color: ColorName
      line: Line
      id: number
    }
  }
}


const requireFloor = require.context('../resources/', false, /floor-\d+\.json/)

const floors: Floor[] = []
requireFloor.keys().forEach((key: string) => {
  floors.push(requireFloor(key))
})

export const floorConfig = floors.map(flr => ({
  floorId: flr.floorId,
  floorName: `${flr.buildingName}-${flr.floorNumber}`,
}))

export default floors
