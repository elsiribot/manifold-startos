# manifold-startos

StartOS (0.4.x) service package for **Fleet Manager (FMan)**, the
guardian-hosting daemon of [fedibtc/manifold](https://github.com/fedibtc/manifold).
It builds a side-loadable `.s9pk`.

## Layout

- `startos/` — the package logic (TypeScript, `@start9labs/start-sdk` 2.x):
  manifest, main daemon setup, interfaces, actions, backups, version graph.
- `flake.nix` — builds the service OCI image. It wraps manifold's
  `fleet-manager-oci-image` (pinned via `flake.lock`) and materializes
  `/etc/passwd`, `/etc/group`, `/etc/nsswitch.conf`, and the CA bundle as
  regular files: StartOS SubContainers cannot resolve `/etc` symlinks into
  `/nix/store`, and the bundled fedimintd performs user lookups.
- `Makefile` — thin wrapper over the SDK's `s9pk.mk`, plus an
  `image-loaded` target that nix-builds the image and loads it into podman
  before packing (the manifest references it as
  `dockerTag: localhost/fleet-manager-startos:0.1.0`).

## Build

Requirements: `start-cli`, node/npm, git, jq, nix, podman (rootless is
fine), `mksquashfs` (squashfs-tools) and `tar2sqfs` (squashfs-tools-ng).

The repo must live inside a StartOS packaging workspace
(`start-cli s9pk init-workspace` in the parent directory). `start-cli`
resolves the workspace's default host target on startup, so if you have no
dev server, set `host.default` in `<workspace>/.startos/config.yaml` to
`https://localhost`. Without a docker daemon, set `STARTOS_USE_PODMAN=1` so
`start-cli` drives podman.

```sh
npm ci
STARTOS_USE_PODMAN=1 make x86   # -> fleet-manager_x86_64.s9pk
```

`make arm` additionally needs an aarch64 build of the OCI image (build the
flake on an arm machine or with binfmt emulation, then `podman load` it).

To bump the packaged manifold revision: `nix flake update manifold`, adjust
the version in `startos/versions/current.ts`, and rebuild.

## Automated releases

`.github/workflows/update.yml` polls `fedibtc/manifold` master hourly (and
runs on manual dispatch, with an optional `force` input). The poll is a
cheap `git ls-remote` compared against `flake.lock`; when master moved (and
no release for that revision exists yet) a build job updates the `manifold`
flake input, bumps the package revision to `<upstream>:<YYYYMMDDHH>`,
commits, builds the x86_64 s9pk, and publishes a GitHub release tagged
`manifold-<short-rev>` with the s9pk attached. Old releases are kept, one
per packaged manifold revision. Following tagged upstream releases instead
of master is a future change (pin the flake input to a release tag and poll
`git ls-remote --tags`). Set a `SIGNING_KEY` secret
(ed25519 PKCS#8 PEM, the workspace's `build.key.pem` format) to sign
releases with a stable key; otherwise each run uses a fresh one, which is
fine for side-loading. When upstream's workspace version changes (currently
0.1.0), the image tag in `flake.nix`, the manifest `dockerTag`, the
Makefile `IMAGE_TAG`, and the upstream part of the version in
`startos/versions/current.ts` still need a manual bump (see UPDATING.md).

## Runtime design

- One daemon: `fleet-manager serve` with `--data-dir /data` (volume
  `fman`). Package bookkeeping (`store.json`, the dashboard password file)
  lives on volume `main`, mounted at `/start-os`.
- Bitcoin Core: hard dependency on the `bitcoind` package. The RPC address
  comes from `sdk.host.getBridgeAddress`, credentials from bitcoind's
  `.cookie` (its data volume is mounted read-only at `/mnt/bitcoin`) — the
  same pattern as fedimint-guardian-startos.
- Operator dashboard: bound on `0.0.0.0:8080` with `--admin-http-auth
  password` (StartOS has no authenticating proxy, so `trusted-proxy` mode
  would be unsound). The password is generated on install, stored in
  `store.json`, written with mode 0600 to `/start-os/admin-password` at
  every start, and surfaced via the *Show Dashboard Password* action.
- Seat port grid: UDP 30000–30031 (8 seats × 4 ports) is published as a
  port-range interface so iroh can hole-punch direct paths instead of
  falling back to relays. FMan itself binds no fixed public TCP port; its
  FI-facing RPC is iroh with discovery via Nostr/pkarr.
- Onboarding (identity mnemonic, seat capacity/price) happens in the
  dashboard after first start; the daemon idles until onboarding completes.
- Backups include both volumes, excluding `admin.sock` and
  `fleet-manager.lock`; post-restore, `safe-events/` journals (daemon and
  per-seat) are deleted as required by manifold's restore contract.
