import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'fleet-manager',
  title: 'Fleet Manager',
  license: 'MIT',
  packageRepo: 'https://github.com/fedibtc/manifold-startos',
  upstreamRepo: 'https://github.com/fedibtc/manifold',
  marketingUrl: 'https://fedi.xyz/',
  donationUrl: null,
  description: {
    short: {
      en_US: 'Host Fedimint guardians for decentralized federations',
    },
    long: {
      en_US:
        'Fleet Manager (FMan) is the guardian-hosting daemon of the Manifold ' +
        'project. It offers guardian seats to Federation Initiators using the ' +
        'Fedi app: each purchased seat runs a bundled fedimintd guardian node ' +
        'for a Fedimint federation, supervised by the Fleet Manager. Operators ' +
        'earn fees for hosting seats. Requires a synced Bitcoin node.',
    },
  },
  volumes: ['main', 'fman'],
  images: {
    'fleet-manager': {
      /**
       * Built by this repo's nix flake from fedibtc/manifold's
       * fleet-manager-oci-image and loaded into podman by `make`
       * (see the image-loaded target).
       */
      source: { dockerTag: 'localhost/fleet-manager-startos:0.1.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    bitcoind: {
      description: {
        en_US:
          'Fleet Manager requires a local, fully synced Bitcoin node for the ' +
          'guardian nodes it hosts',
      },
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/feec0b1dae42961a257948fe39b40caf8672fce1/dep-icon.svg',
      },
    },
  },
})
