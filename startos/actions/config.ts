import { storeJson } from '../fileModels/store'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  environment: Value.select({
    name: 'Manifold Environment',
    description:
      'The Manifold trust environment this Fleet Manager participates in. ' +
      'It determines the active Nostr relays and the setup-payment ' +
      'publisher identity. Use Production unless you are testing against ' +
      "Fedi's staging infrastructure.",
    default: 'production',
    values: {
      production: 'Production',
      staging: 'Staging',
    },
  }),
  pushGatewayOrigin: Value.text({
    name: 'Push Gateway Origin',
    description:
      'The exact public HTTPS origin of the push gateway accepted for ' +
      'callback bearer URLs, e.g. https://push.example.org. Leave empty to ' +
      'run without push notification callbacks.',
    required: false,
    default: null,
    patterns: [
      {
        regex: '^https://.*',
        description: 'Must be a valid HTTPS URL',
      },
    ],
  }),
})

export const config = sdk.Action.withInput(
  'config',
  async ({ effects }) => ({
    name: 'Configure',
    description: 'Configure the Manifold environment and push gateway',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const store = await storeJson.read().once()
    return {
      environment: store?.environment ?? 'production',
      pushGatewayOrigin: store?.pushGatewayOrigin ?? null,
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      environment: input.environment,
      pushGatewayOrigin: input.pushGatewayOrigin ?? undefined,
    })
  },
)
