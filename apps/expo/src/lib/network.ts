import * as ExpoNetwork from "expo-network"

type Subscription = (online: boolean) => void

export class Network {
  private static instance: Network

  private subs: Set<Subscription> = new Set()
  private prevIsInternetReachable = true

  constructor() {
    if (Network.instance) {
      return Network.instance
    }
    Network.instance = this

    const checkOnline = async () => {
      const { isInternetReachable } = await this.getNetworkStateAsync()
      if (this.prevIsInternetReachable === isInternetReachable) return
      this.publish(isInternetReachable)
      this.prevIsInternetReachable = isInternetReachable
    }
    setInterval(checkOnline, 6 * 1000)
    checkOnline()
  }

  async getNetworkStateAsync() {
    const { isInternetReachable } = await ExpoNetwork.getNetworkStateAsync()
    return { isInternetReachable: Boolean(isInternetReachable) }
  }

  removeListener(listener: Subscription) {
    this.subs.delete(listener)
  }

  addEventListener(listener: Subscription) {
    this.subs.add(listener)
    return () => this.removeListener(listener)
  }

  publish(online: boolean) {
    this.subs.forEach(listener => listener(online))
  }
}
