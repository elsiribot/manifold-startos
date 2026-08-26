import { storeJson } from '../fileModels/store'
import { sdk } from '../sdk'

export const showAdminPassword = sdk.Action.withoutInput(
  'show-admin-password',
  async ({ effects }) => ({
    name: 'Show Dashboard Password',
    description:
      'Display the password for logging into the operator dashboard',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const password = await storeJson.read((s) => s.adminPassword).once()
    if (!password) {
      throw new Error('The dashboard password has not been generated yet')
    }
    return {
      version: '1',
      title: 'Dashboard Password',
      message: 'Use this password to log into the operator dashboard',
      result: {
        type: 'single',
        name: 'Password',
        description: null,
        value: password,
        copyable: true,
        qr: false,
        masked: true,
      },
    }
  },
)
