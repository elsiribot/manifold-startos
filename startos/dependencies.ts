import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.4:14',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
