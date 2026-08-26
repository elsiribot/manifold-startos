import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { z } from 'zod'

const shape = z.object({
  /**
   * Canonical Manifold environment profile: source of the active Nostr
   * relays and the setup-payment publisher identity.
   */
  environment: z.enum(['production', 'staging']).catch('production'),
  /**
   * Exact public push-gateway origin accepted for callback bearer URLs.
   * Optional: when unset, fleet-manager runs without push notification
   * callbacks.
   */
  pushGatewayOrigin: z.string().optional(),
  /**
   * Password for the operator dashboard, generated on install and passed to
   * fleet-manager via --admin-http-password-file.
   */
  adminPassword: z.string().optional(),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
