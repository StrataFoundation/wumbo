import { useState } from "react"

interface Props {
  first: (setSwapped: any) => JSX.Element
  second: (setSwapped: any) => JSX.Element
}

export const SideSwap = ({ first, second }: Props) => {
  const [swapped, setSwapped] = useState<boolean>(false)
  return swapped ? second(setSwapped) : first(setSwapped)
}
