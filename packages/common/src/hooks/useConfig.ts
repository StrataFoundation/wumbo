import { useContext } from "react"
import { ConfigContext, IWumboConfig } from "../contexts/configContext"

export const useConfig = (): IWumboConfig => {
  return useContext(ConfigContext)
}