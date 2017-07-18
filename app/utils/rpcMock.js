import moment from 'moment'

const floorCoordConfigArray = [
  {
    floorId: 6,
    floorName: 'B座 9楼',
    diffX: 0,
    diffY: 0,
    rotAng: 0,
    scale: 29.469852768927,
    pixX: 2332,
    pixY: 2784,
  },
  {
    floorId: 31,
    floorName: 'B座 1楼',
    diffX: 2290,
    diffY: 550,
    rotAng: 3.3,
    scale: 25.5,
    pixX: 2319,
    pixY: 2761,
  },
  {
    floorId: 32,
    floorName: 'B座 2楼',
    diffX: 2290,
    diffY: 700,
    rotAng: 3.3,
    scale: 25.5,
    pixX: 2346,
    pixY: 2795,
  },
  {
    floorId: 33,
    floorName: 'B座 3楼',
    diffX: 2230,
    diffY: 800,
    rotAng: 3.3,
    scale: 25.5,
    pixX: 2308,
    pixY: 2766,
  },
  {
    floorId: 34,
    floorName: 'B座 4楼',
    diffX: 2330,
    diffY: 700,
    rotAng: 3.3,
    scale: 28,
    pixX: 2331,
    pixY: 2766,
  },
  {
    floorId: 35,
    floorName: 'B座 5楼',
    diffX: 2330,
    diffY: 730,
    rotAng: 3.3,
    scale: 57.5,
    pixX: 2265,
    pixY: 2741,
  },
  {
    floorId: 36,
    floorName: 'B座 6楼',
    diffX: 2230,
    diffY: 560,
    rotAng: 3.3,
    scale: 25.7,
    pixX: 2255,
    pixY: 2733,
  },
  {
    floorId: 61,
    floorName: 'B座 7楼',
    diffX: 2250,
    diffY: 570,
    rotAng: 3.3,
    scale: 25,
    pixX: 2255,
    pixY: 2733,
  },
  {
    floorId: 62,
    floorName: 'B座 8楼',
    diffX: 0,
    diffY: 0,
    rotAng: 0,
    scale: 29.469852768927,
    pixX: 2332,
    pixY: 2784,
  },
]

const converters = {}
for (const config of floorCoordConfigArray) {
  converters[config.floorId] = (x, y) => {
    const xScaled = -x * config.scale
    const yScaled = y * config.scale

    const radians = config.rotAng * Math.PI / 180.0
    const xRotated = xScaled * Math.cos(radians) - yScaled * Math.sin(radians)
    const yRotated = xScaled * Math.sin(radians) + yScaled * Math.cos(radians)

    const xMoved = xRotated + config.diffX
    const yMoved = yRotated + config.diffY
    return { x: xMoved, y: yMoved }
  }
}

const db = {
  mappings: [
    { id: 1, mac: '01:23:45:67:89:ab', name: 'test-mac' },
    { id: 2, name: 'test-mac-2', mac: 'aa:bb:cc:dd:ee:bb' },
    { id: 6, name: 'sfc-samsung', mac: 'a4:08:ea:0b:c9:3d' },
    { id: 7, name: 'lh-iphone', mac: 'c8:1e:e7:c1:1e:72' },
    { id: 8, name: 'cx-meizu', mac: '38:bc:1a:d2:58:ed' },
    { id: 9, name: 'lxy-meizu', mac: '68:3e:34:2d:79:c0' },
    { id: 10, name: 'sfc-xps', mac: 'ac:d1:b8:bf:3c:87' },
    { id: 11, name: '实际情况', mac: '00:00:00:00:00:00' },
    { id: 12, name: 'ttttt', mac: '12:34:56:78:90:ab' },
  ],
}

export async function getStaticMacMappings() {
  // get-static-mac-mappings
  return {
    ok: true,
    mappings: JSON.parse(JSON.stringify(db.mappings)),
  }
}

export async function deleteStaticMacMapping(id) {
  // delete-static-mac-mapping
  db.mappings = db.mappings.filter(mapping => mapping.id !== id)
  return { ok: true }
}

export async function addStaticMacMapping(name, mac) {
  // add-static-mac-mapping
  const nextId = db.mappings.reduce((max, { id }) => Math.max(max, id), 0) + 1
  db.mappings.push({
    id: nextId,
    name,
    mac,
  })
  return { ok: true, id: nextId }
}

// export const updateStaticMacMapping = rpc('update-static-mac-mapping')
export async function updateStaticMacMapping(id, name, mac) {
  for (const mapping of db.mappings) {
    if (mapping.id === id) {
      mapping.name = name
      mapping.mac = mac
    }
  }
  return { ok: true }
}

export async function getLocations(date) {
  const datePart = moment(date).format('YYYY-MM-DD')
  const response = await fetch(`/static/locations/${datePart}.json`)
  if (response.ok) {
    const rawItems = await response.json()
    return rawItems.map((item) => {
      const { x, y } = converters[item.floorId](item.x, item.y)
      return {
        floorId: item.floorId,
        x,
        y,
        time: item.time,
      }
    })
  } else {
    // eslint-disable-next-line no-console
    console.warn('response not ok')
    return []
  }
}
