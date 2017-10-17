import { Map, List } from 'immutable'
import * as _ from 'lodash'
import { config } from './config'
import { CXData } from './TestDatInterface'

export default async function fetchCXServer(
  macs: string[],
  clusterType: string,
  clusterValues: List<any>,
  fixerType: string,
  fixerValues: List<any>,
): Promise<CXData> {
  const configClusterArgs = config.cluster.find(c => c.clusterType === clusterType).args
  const cluster = Map({ clusterType })
    .merge(Map(configClusterArgs.map((arg, i) => [arg.name, clusterValues.get(i)])))
  const configFixerArgs = config.floorFixer.find(f => f.fixerType === fixerType).args
  const floorFixer = Map({ fixerType })
    .merge(Map(configFixerArgs.map((arg, i) => [arg.name, fixerValues.get(i)])))

  const body = JSON.stringify({
    // TODO: add date
    macs,
    cluster,
    floorFixer,
  }, null, 2)
  console.log(body)

  try {
    const response = await fetch('http://10.214.224.82:8892/algorithm/generateRawTracking', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Server does not respond with 200')
    }
  } catch (e) {
    console.error(e)
  }
}
