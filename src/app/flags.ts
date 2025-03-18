import { flag } from 'flags/next'

export const exampleFlag = flag({
  key: 'example-flag',
  decide() {
    return Math.random() > 0.5
  },
})

export const storeFlag = flag({
  key: 'store-flag',
  decide() {
    return 1
  },
})