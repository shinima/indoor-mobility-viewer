const host = 'http://10.214.224.29:3000'
const prefix = '/rpc@'
function rpc(endpoint) {
  return async function rpcfn(...args) {
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
