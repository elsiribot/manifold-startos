# Updating the packaged manifold revision

1. `nix flake update manifold` — pins the latest `fedibtc/manifold` master.
2. Check upstream's workspace version (`version` in manifold's
   `Cargo.toml`); if it changed, update the image tag in `flake.nix` and in
   `startos/manifest/index.ts` (`dockerTag`), and the `IMAGE_TAG` in the
   `Makefile`.
3. Bump `version` in `startos/versions/current.ts` (format
   `<upstream>:<package revision>`) and write release notes. Move the old
   version entry to `startos/versions/` history if a migration is needed.
4. `make clean && npm ci && make x86` and verify with
   `start-cli s9pk inspect fleet-manager_x86_64.s9pk manifest`.
