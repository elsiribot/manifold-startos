import { sdk } from '../sdk'
import { config } from './config'
import { showAdminPassword } from './showAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(config)
  .addAction(showAdminPassword)
