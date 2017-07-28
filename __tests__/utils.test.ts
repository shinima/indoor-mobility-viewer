import { subtract } from '../app/utils/LocationItemCache'

test('subtract test-1: simple case', () => {
  expect(subtract({ left: 10, right: 20 }, [
    { left: 5, right: 15 },
  ])).toEqual([
    { left: 15, right: 20 },
  ])
})

test('subtract test-2: empty subtrahend', () => {
  expect(subtract({ left: 10, right: 20 }, [])).toEqual([
    { left: 10, right: 20 },
  ])
})

test('subtract test-3: general case', () => {
  expect(subtract({ left: 10, right: 20 }, [
    { left: 0, right: 8 },
    { left: 12, right: 15 },
    { left: 18, right: 25 },
  ])).toEqual([
    { left: 10, right: 12 },
    { left: 15, right: 18 },
  ])
})

test('subtract test-4: more complex case', () => {
  expect(subtract({ left: 20, right: 100 }, [
    { left: 0, right: 15 },
    { left: 18, right: 23 },
    { left: 40, right: 60 },
    { left: 70, right: 85 },
    { left: 95, right: 120 },
    { left: 130, right: 150 },
    { left: 200, right: 250 },
  ])).toEqual([
    { left: 23, right: 40 },
    { left: 60, right: 70 },
    { left: 85, right: 95 },
  ])
})
