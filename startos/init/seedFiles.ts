import * as crypto from 'crypto'
import { storeJson } from '../fileModels/store'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // Creates store.json with schema defaults if absent.
  await storeJson.merge(effects, {})
  if (!(await storeJson.read((s) => s.adminPassword).once())) {
    await storeJson.merge(effects, {
      adminPassword: crypto.randomBytes(16).toString('base64url'),
    })
  }
})
