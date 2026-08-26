import { storeJson } from './fileModels/store'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const environment = await storeJson
    .read((s) => s.environment)
    .const(effects)
  // The staging profile ships a default Esplora backend (Mutinynet/Signet),
  // so only production needs a local mainnet node.
  if (environment === 'staging') return {}
  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.4:14',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
