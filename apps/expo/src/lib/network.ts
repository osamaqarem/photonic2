import * as ExpoNetwork from "expo-network"
import { Platform } from "react-native"

type Subscription = (online: boolean) => void

export class Network {
  private static instance: Network

  private subs: Array<Subscription> = []
  private prevIsInternetReachable = true

  constructor() {
    if (Network.instance) {
      return Network.instance
    }
    Network.instance = this

    // ssr
    if (Platform.OS === "web" && !(typeof window === "object" && navigator)) {
      return this
    }

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
    this.subs = this.subs.filter(fn => fn !== listener)
  }

  addEventListener(listener: Subscription) {
    this.subs.push(listener)
    return () => this.removeListener(listener)
  }

  publish(online: boolean) {
    this.subs.forEach(listener => listener(online))
  }
}
