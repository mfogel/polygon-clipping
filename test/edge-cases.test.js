/* eslint-env jest */

const martinez = require('../src/')
const load = require('load-json-file')
const path = require('path')

describe('touching hourglasses', () => {
  const shapes = load.sync(
    path.join(__dirname, 'fixtures', 'hourglasses.geojson')
  )
  const subject = shapes.features[0]
  const clipping = shapes.features[1]

  test('intersection', () => {
    const result = martinez.intersection(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 0.5], [0.25, 0.75], [0, 1], [0, 0.5]]],
      [[[0.75, 0.75], [1, 0.5], [1, 1], [0.75, 0.75]]]
    ])
  })

  test('union', () => {
    const result = martinez.union(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [
        [
          [0, 0],
          [0.5, 0.5],
          [0.25, 0.75],
          [0.5, 1],
          [0, 1.5],
          [0, 1],
          [0, 0.5],
          [0, 0]
        ]
      ],
      [
        [
          [0.5, 0.5],
          [1, 0],
          [1, 0.5],
          [1, 1],
          [1, 1.5],
          [0.5, 1],
          [0.75, 0.75],
          [0.5, 0.5]
        ]
      ]
    ])
  })

  test('difference', () => {
    const result = martinez.difference(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 0], [0.5, 0.5], [0.25, 0.75], [0, 0.5], [0, 0]]],
      [[[0.5, 0.5], [1, 0], [1, 0.5], [0.75, 0.75], [0.5, 0.5]]]
    ])
  })

  test('difference 2', () => {
    const result = martinez.difference(
      clipping.geometry.coordinates,
      subject.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 1], [0.25, 0.75], [0.5, 1], [0, 1.5], [0, 1]]],
      [[[0.5, 1], [0.75, 0.75], [1, 1], [1, 1.5], [0.5, 1]]]
    ])
  })
})

describe('polygon + trapezoid', () => {
  const shapes = load.sync(
    path.join(__dirname, 'fixtures', 'polygon_trapezoid_edge_overlap.geojson')
  )
  const subject = shapes.features[0]
  const clipping = shapes.features[1]

  test('intersection', () => {
    const result = martinez.intersection(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[3.5, 3.5], [7, 0], [14, 0], [17.5, 3.5], [3.5, 3.5]]]
    ])
  })

  test('union', () => {
    const result = martinez.union(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [
        [
          [0, 0],
          [7, 0],
          [14, 0],
          [21, 0],
          [21, 3.5],
          [17.5, 3.5],
          [21, 7],
          [0, 7],
          [3.5, 3.5],
          [0, 3.5],
          [0, 0]
        ]
      ]
    ])
  })

  test('difference', () => {
    const result = martinez.difference(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 0], [7, 0], [3.5, 3.5], [0, 3.5], [0, 0]]],
      [[[14, 0], [21, 0], [21, 3.5], [17.5, 3.5], [14, 0]]]
    ])
  })
})

describe('overlapping edge + one inside', () => {
  const shapes = load.sync(
    path.join(__dirname, 'fixtures', 'overlap_loop.geojson')
  )
  const subject = shapes.features[0]
  const clipping = shapes.features[1]

  test('intersection', () => {
    const result = martinez.intersection(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [
        [
          [57.8, -49.1],
          [177.8, -49.1],
          [177.8, -37.1],
          [57.8, -37.1],
          [57.8, -49.1]
        ]
      ]
    ])
  })

  test('union', () => {
    const result = martinez.union(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [
        [
          [57.8, -97.1],
          [196.4, -97.1],
          [196.4, -11.5],
          [57.8, -11.5],
          [57.8, -37.1],
          [57.8, -49.1],
          [57.8, -97.1]
        ]
      ]
    ])
  })

  test('difference', () => {
    const result = martinez.difference(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([])
  })
})

describe('overlapping Y shift', () => {
  const shapes = load.sync(
    path.join(__dirname, 'fixtures', 'overlap_y.geojson')
  )
  const subject = shapes.features[0]
  const clipping = shapes.features[1]

  test('intersection', () => {
    const result = martinez.intersection(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[-1883, -8.5], [-1783, -8.5], [-1783, -3], [-1883, -3], [-1883, -8.5]]]
    ])
  })

  test('union', () => {
    const result = martinez.union(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [
        [
          [-1883, -25],
          [-1783, -25],
          [-1783, -8.5],
          [-1783, -3],
          [-1783, 75],
          [-1883, 75],
          [-1883, -3],
          [-1883, -8.5],
          [-1883, -25]
        ]
      ]
    ])
  })

  test('difference', () => {
    const result = martinez.difference(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([])
  })
})

describe('touching boxes', () => {
  const shapes = load.sync(
    path.join(__dirname, 'fixtures', 'touching_boxes.geojson')
  )
  const subject = shapes.features[0]
  const clipping = shapes.features[1]

  test('intersection', () => {
    const result = martinez.intersection(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([])
  })

  test('union', () => {
    const result = martinez.union(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 0], [3, 0], [3, 1], [4, 1], [4, 2], [3, 2], [3, 3], [0, 3], [0, 0]]]
    ])
  })

  test('difference', () => {
    const result = martinez.difference(
      subject.geometry.coordinates,
      clipping.geometry.coordinates
    )
    expect(result).toEqual([
      [[[0, 0], [3, 0], [3, 1], [3, 2], [3, 3], [0, 3], [0, 0]]]
    ])
  })
})

test('disjoint union nesting', () => {
  // issue #47
  const p1 = [
    [[12.91, 6.09], [12.91, 6.91], [12.09, 6.91], [12.09, 6.09], [12.91, 6.09]]
  ]
  const p2 = [
    [
      [12.75, 6.25],
      [12.75, 6.75],
      [11.75, 6.75],
      [11.75, 8.25],
      [12.75, 8.25],
      [12.75, 8.75],
      [11.75, 8.75],
      [11.75, 9.75],
      [11.25, 9.75],
      [11.25, 8.75],
      [10.25, 8.75],
      [10.25, 8.25],
      [11.25, 8.25],
      [11.25, 6.75],
      [10.25, 6.75],
      [10.25, 6.25],
      [12.75, 6.25]
    ],
    [[4.75, 2.25], [4.75, 2.75], [4.25, 2.75], [4.25, 2.25], [4.75, 2.25]]
  ]
  expect(martinez.union(p1, p2)).toEqual([
    [
      [[[[4.25, 2.25], [4.75, 2.25], [4.75, 2.75], [4.25, 2.75], [4.25, 2.25]]]]
    ],
    [
      [
        [10.25, 6.25],
        [12.09, 6.25],
        [12.09, 6.09],
        [12.91, 6.09],
        [12.91, 6.91],
        [12.09, 6.91],
        [12.09, 6.75],
        [11.75, 6.75],
        [11.75, 8.25],
        [12.75, 8.25],
        [12.75, 8.75],
        [11.75, 8.75],
        [11.75, 9.75],
        [11.25, 9.75],
        [11.25, 8.75],
        [10.25, 8.75],
        [10.25, 8.25],
        [11.25, 8.25],
        [11.25, 6.75],
        [10.25, 6.75],
        [10.25, 6.25]
      ]
    ]
  ])
})

test('no rounding error between intersection calculation and triangle area', () => {
  const p1 = [
    [
      [-62.8, -41],
      [-63.0001099, -41.1121599],
      [-62.93564, -41.0940399],
      [-62.8, -41]
    ]
  ]
  const p2 = [
    [
      [-62.8, -41.2],
      [-62.8, -41],
      [-62.964969880531925, -41.10228339712406],
      [-63.0001099, -41.1121599],
      [-62.8, -41.2]
    ]
  ]
  const expected = [
    [
      [
        [-63.0001099, -41.1121599],
        [-62.964969880531925, -41.10228339712406],
        [-62.8, -41],
        [-63.0001099, -41.1121599]
      ]
    ]
  ]

  expect(martinez.difference(p1, p2)).toEqual(expected)
})

test('collapsed edges removed', () => {
  const p1 = [
    [
      [355, 139],
      [420, 202],
      [384, 237],
      [353, 205],
      [330, 230],
      [330, 230],
      [291, 197]
    ]
  ]
  const p2 = [
    [
      [355, 139],
      [420, 202],
      [384, 237],
      [353, 205],

      [330, 230],
      [330, 230],
      [291, 197]
    ]
  ]

  expect(martinez.intersection(p1, p2)).toEqual([
    [[[291, 197], [330, 230], [353, 205], [384, 237], [420, 202], [355, 139]]]
  ])
})

test('overlapping edges difference', () => {
  // issue #35
  const p1 = [[[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]]]
  const p2 = [[[1, 0], [2, 0], [2, 4], [1, 4], [1, 0]]]

  const result = martinez.difference(p1, p2)
  expect(result).toEqual([
    [[[0, 0], [1, 0], [1, 3], [0, 3], [0, 0]]],
    [[[2, 0], [3, 0], [3, 3], [2, 3], [2, 0]]]
  ])
})
