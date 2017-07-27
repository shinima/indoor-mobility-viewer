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

export const getStaticMacMappings = rpc('get-static-mac-mappings')
export const deleteStaticMacMapping = rpc('delete-static-mac-mapping')
export const addStaticMacMapping = rpc('add-static-mac-mapping')
export const updateStaticMacMapping = rpc('update-static-mac-mapping')

type Rpc<ARG1, ARG2, ARG3, Data> = (arg1: ARG1, arg2: ARG2, arg3: ARG3) => Promise<{
  ok: boolean
  message?: string
  data?: Data
}>

export const getLocations = rpc('get-locations') as Rpc<MomentInput, MomentInput, number[], LocationItem[]>
