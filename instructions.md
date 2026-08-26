# Fleet Manager

Fleet Manager (FMan) hosts Fedimint guardian nodes ("seats") for
decentralized federations built with the
[Manifold](https://github.com/fedibtc/manifold) project. Federation
Initiators using the Fedi app discover your Fleet Manager over Nostr and can
purchase guardian seats from it; each active seat runs a bundled `fedimintd`
guardian node supervised by the daemon. You earn fees for hosting seats.

## Requirements

- **Bitcoin Core**: a fully synced local Bitcoin node (the Bitcoin Core
  service on this server) is required. Guardian nodes use it to follow the
  chain.
- **Memory**: plan roughly 1.5 GB of available RAM per guardian seat you
  intend to offer (about 280 MB per running seat plus headroom), up to
  8 seats.
- **Uptime**: guardians must be online for their federations to function.
  Only offer seats from a machine that runs continuously.

## First start

1. Make sure Bitcoin Core is installed, running, and fully synced.
2. Optionally run the **Configure** action to select the Manifold
   environment (keep *Production* unless you are testing) and to set a push
   gateway origin.
3. Start the service.
4. Run the **Show Dashboard Password** action and copy the password.
5. Open the **Operator Dashboard** interface and log in with that password.
6. Complete onboarding in the dashboard: create (or restore) the operator
   identity, **write down the mnemonic**, and set your seat capacity and
   price.

## Backups

Use StartOS backups. The mnemonic alone is **not** a sufficient backup of a
Fleet Manager: guardian key shares created after federation setup are not
derived from it, so a full data backup is required. Restoring a backup onto
a new machine while the original is still running would make your guardians
misbehave (equivocate) — only restore when the original host is permanently
gone.

## Networking

Hosted guardian nodes communicate over iroh (QUIC/UDP) and can usually
connect through NAT without any configuration, falling back to public
relays when they cannot. For best performance, forward UDP ports
30000–30031 from your router to this server so peers can reach your
guardians directly.
