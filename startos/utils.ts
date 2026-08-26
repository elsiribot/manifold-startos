/** Internal port of the operator dashboard / HTTP admin API. */
export const uiPort = 8080

/**
 * First seat port block of the `base + 4k` port grid handed to hosted
 * fedimintd seats (fleet-manager's `--first-port-base` default). Seat
 * ordinals are lifetime-monotonic, so publishing 8 blocks (32 ports) covers
 * the first 8 seats this host ever creates.
 */
export const seatPortBase = 30000
export const seatPortCount = 32

/**
 * Path of the operator dashboard password file, as seen inside the
 * container ('main' volume is mounted at /start-os) and from package hooks
 * on the host (volumes are addressed as /media/startos/volumes/<name>).
 */
export const adminPasswordFile = '/start-os/admin-password'
export const adminPasswordFileHostPath =
  '/media/startos/volumes/main/admin-password'
