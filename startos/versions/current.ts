import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:2026082619',
  releaseNotes: {
    en_US:
      'Fixes the service container failing to start: the nix-built image ' +
      'lacked the standard runtime mountpoint directories (/proc, /sys, ' +
      '/dev, /run, /tmp) that the StartOS container launcher requires. ' +
      'Also, the staging environment no longer requires Bitcoin Core: it ' +
      "uses the profile's built-in Esplora backend (Mutinynet/Signet); the " +
      'bitcoind dependency now applies only to the production environment.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
