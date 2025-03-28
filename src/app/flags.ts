import { flag } from 'flags/next'

export const storeFlag = flag({
  key: 'store-flag',
  decide() {
    return 1
  },
})