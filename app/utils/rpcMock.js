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
