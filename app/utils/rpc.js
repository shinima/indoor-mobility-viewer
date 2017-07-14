const host = 'http://10.214.224.29:3000'
const prefix = '/rpc@'
export default function rpc(endpoint) {
  return async function (...args) {
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
