import { MomentInput } from 'moment'

const host = 'http://localhost:3000'
const prefix = '/rpc@'

function rpc(endpoint: string) {
  return async function rpcfn(...args: any[]) {
    const response = await fetch(`${host}${prefix}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    })
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Server does not respond with 200')
    }
  }
}

type Data<T = null> = Promise<{
  ok: boolean
  message?: string
  data?: T
}>

type GetStaticMacMappings = () => Data<{
  id: number
  name: string
  mac: string
}[]>
export const getStaticMacMappings: GetStaticMacMappings = rpc('get-static-mac-mappings')

export const deleteStaticMacMapping = rpc('delete-static-mac-mapping')
export const addStaticMacMapping = rpc('add-static-mac-mapping')
export const updateStaticMacMapping = rpc('update-static-mac-mapping')

type GetLocationsByTime = (start: MomentInput, end: MomentInput, floorIds?: number[]) => Data<LocationItem[]>
export const getLocationsByTime: GetLocationsByTime = rpc('get-locations-by-time')

type GetLocationsByMac = (date: MomentInput, macList: string[]) => Data<LocationItem[]>
export const getLocationsByMac: GetLocationsByMac = rpc('get-locations-by-mac')
