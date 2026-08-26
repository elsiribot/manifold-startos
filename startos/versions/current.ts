import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:1',
  releaseNotes: {
    en_US:
      'The staging environment no longer requires Bitcoin Core: it uses ' +
      "the profile's built-in Esplora backend (Mutinynet/Signet), matching " +
      'the reference deployment. The bitcoind dependency now applies only ' +
      'to the production environment.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
