import { GenericAsset } from "src/features/photo/list/models/asset"

export type MainStackParams = {
  home: undefined
  photo: {
    asset: GenericAsset
  }
  "settings-stack": undefined
}

export type SettingsStackParams = {
  settings: undefined
  login: undefined
  appearance: undefined
}

export type AppParams = MainStackParams & SettingsStackParams
