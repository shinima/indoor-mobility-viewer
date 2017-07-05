export function isSameTracks(ts1, ts2) {
  if (ts1.length !== ts2.length) {
    return false
  }
  for (let index = 0; index < ts1.length; index += 1) {
    if (ts1[index].trackId !== ts2[index].trackId) {
      return false
    }
  }
  return true
}

export function isSameItems(items1, items2) {
  if (items1.length !== items2.length) {
    return false
  }
  for (let index = 0; index < items1.length; index += 1) {
    if (items1[index].id !== items2[index].id) {
      return false
    }
  }
  return true
}
