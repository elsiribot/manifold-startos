import { restoreInit } from '../backups'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { setInterfaces } from '../interfaces'
import { setDependencies } from '../dependencies'
import { sdk } from '../sdk'
import { seedFiles } from './seedFiles'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  setDependencies,
  actions,
)

export const uninit = sdk.setupUninit(versionGraph)
