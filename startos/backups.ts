import * as fs from 'fs'
import * as path from 'path'
import { sdk } from './sdk'

const fmanVolume = '/media/startos/volumes/fman'

export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) =>
    sdk.Backups.ofVolumes('main', 'fman')
      .setOptions({ exclude: ['admin.sock', 'fleet-manager.lock'] })
      .setPostRestore(async (effects) => {
        // A restored data root must not replay "safe to share" event
        // journals recorded on the original host (see the fman-cli
        // backup/restore documentation): delete the daemon journal and every
        // seat journal before first start.
        const safeEventDirs = [path.join(fmanVolume, 'safe-events')]
        const seatsDir = path.join(fmanVolume, 'seats')
        if (fs.existsSync(seatsDir)) {
          for (const seat of fs.readdirSync(seatsDir)) {
            safeEventDirs.push(path.join(seatsDir, seat, 'safe-events'))
          }
        }
        for (const dir of safeEventDirs) {
          fs.rmSync(dir, { recursive: true, force: true })
        }
      }),
)
