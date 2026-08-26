# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for
StartOS. The packaging guide is at <https://docs.start9.com/packaging>;
start at the recipe index
(<https://docs.start9.com/packaging/recipes.html>) before changing package
behavior.

Keep `README.md` (technical reference) and `instructions.md` (end-user
docs) in sync with your changes.

## This repo

- **The service image is nix-built, not Dockerfile-built.** `flake.nix`
  wraps manifold's `fleet-manager-oci-image` and the Makefile loads it into
  podman before `start-cli s9pk pack` runs (`dockerTag` source). Bumping
  manifold means `nix flake update manifold`, not editing a Dockerfile.
- **The `/etc` materialization in `flake.nix` is deliberate.** StartOS
  SubContainers fail on `/etc` symlinks into `/nix/store`, and the bundled
  fedimintd performs getpwuid lookups. Do not "simplify" it away.
- **`--admin-http-auth password` is deliberate.** StartOS exposes service
  UIs without an authenticating proxy, so fleet-manager's `trusted-proxy`
  mode is unsound here.
- **`backups.ts` addresses volumes as `/media/startos/volumes/<name>`** —
  the container runtime's own mount of them, not the host path you see over
  SSH. The post-restore deletion of `safe-events/` journals is required by
  manifold's restore contract (see `packages/fleet-manager/README.md` and
  the `fman-cli` restore documentation upstream).
