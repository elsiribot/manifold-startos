import * as fs from 'fs'
import { FileHelper } from '@start9labs/start-sdk'
import { manifest as bitcoinManifest } from 'bitcoin-core-startos/startos/manifest'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store'
import { adminPasswordFile, adminPasswordFileHostPath, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting Fleet Manager!')

  const store = await storeJson.read().const(effects)
  if (!store?.adminPassword) {
    throw new Error('The dashboard password has not been generated yet')
  }

  // fleet-manager reads the dashboard password from a file that must not be
  // group/other accessible.
  fs.writeFileSync(adminPasswordFileHostPath, store.adminPassword, {
    mode: 0o600,
  })

  let mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/start-os',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'fman',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    })

  // The staging profile ships a default Esplora backend (Mutinynet/Signet);
  // only production runs against the local mainnet node.
  const useBitcoind = store.environment === 'production'

  if (useBitcoind) {
    mounts = mounts.mountDependency<typeof bitcoinManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mnt/bitcoin',
      readonly: true,
    })
  }

  const fmanSub = sdk.SubContainer.of(
    effects,
    { imageId: 'fleet-manager' },
    mounts,
    'fleet-manager-sub',
  )

  // Absolute path: the nix-built image declares no PATH in its env.
  const command: [string, ...string[]] = [
    '/bin/fleet-manager',
    'serve',
    '--data-dir',
    '/data',
    '--manifold-environment',
    store.environment,
    '--admin-http-bind',
    `0.0.0.0:${uiPort}`,
    // StartOS exposes service UIs on the LAN without an authenticating
    // proxy, so trusted-proxy mode is not sound here.
    '--admin-http-auth',
    'password',
    '--admin-http-password-file',
    adminPasswordFile,
  ]

  if (useBitcoind) {
    const bitcoindAddr = await sdk.host
      .getBridgeAddress(effects, {
        packageId: 'bitcoind',
        hostId: rpcHostId,
        internalPort: rpcPort,
        ssl: false,
      })
      .const()
    if (!bitcoindAddr) {
      throw new Error('Bitcoin is not yet reachable on the internal network')
    }
    const rootfs = await fmanSub.rootfs
    const cookieRaw = await FileHelper.string(`${rootfs}/mnt/bitcoin/.cookie`)
      .read(
        (cookie) => cookie,
        (prev, next) => next === null || prev === next,
      )
      .const(effects)
    if (!cookieRaw) throw new Error('Bitcoind cookie is missing')
    const cookie = cookieRaw.trim()
    const sep = cookie.indexOf(':')
    if (sep < 0) throw new Error('Bitcoind cookie is malformed')
    command.push(
      '--bitcoind-url',
      `http://${bitcoindAddr}`,
      '--bitcoind-username',
      cookie.slice(0, sep),
      // `=` form so a password starting with `-` isn't parsed as a flag
      `--bitcoind-password=${cookie.slice(sep + 1)}`,
    )
  }
  if (store.pushGatewayOrigin) {
    command.push('--push-gateway-origin', store.pushGatewayOrigin)
  }

  return sdk.Daemons.of(effects).addDaemon('fleet-manager', {
    subcontainer: fmanSub,
    exec: {
      command,
      env: {
        // The bundled fedimintd's fs-mistrust checks are meaningless inside
        // the SubContainer and depend on user lookups the image cannot
        // fully support.
        FS_MISTRUST_DISABLE_PERMISSIONS_CHECKS: 'true',
      },
    },
    ready: {
      display: 'Operator Dashboard',
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: 'The operator dashboard is ready',
          errorMessage: 'The operator dashboard is not ready',
        }),
    },
    requires: [],
  })
})
