import { sdk } from './sdk'
import { seatPortBase, seatPortCount, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: uiPort,
  })
  const ui = sdk.createInterface(effects, {
    name: 'Operator Dashboard',
    id: 'ui',
    description:
      'Onboarding, seat management, and monitoring for this Fleet Manager',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  // The seat port grid: 4 UDP ports per hosted fedimintd seat, so iroh can
  // hole-punch direct peer paths instead of falling back to public relays.
  const seatMulti = sdk.MultiHost.of(effects, 'seats-multi')
  const seatOrigin = await seatMulti.bindPortRange({
    internalStartPort: seatPortBase,
    externalStartPort: seatPortBase,
    numberOfPorts: seatPortCount,
  })
  const seatInterface = sdk.createRangeInterface(effects, {
    id: 'seat-ports',
    name: 'Federation Seat Ports',
    description:
      'UDP port grid used by hosted fedimintd guardian nodes (iroh p2p and API)',
    scheme: null,
  })
  await seatOrigin.export(seatInterface)

  return [uiReceipt]
})
