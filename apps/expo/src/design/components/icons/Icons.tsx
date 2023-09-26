import React from "react"

import { Archive } from "~/expo/design/components/icons/files/Archive"
import { ArrowRightDoor } from "~/expo/design/components/icons/files/ArrowRightDoor"
import { ArrowUpSquare } from "~/expo/design/components/icons/files/ArrowUpSquare"
import { Check } from "~/expo/design/components/icons/files/Check"
import { ChevronRight } from "~/expo/design/components/icons/files/ChevronRight"
import { Cloud } from "~/expo/design/components/icons/files/Cloud"
import { CloudUp } from "~/expo/design/components/icons/files/CloudUp"
import { Cog } from "~/expo/design/components/icons/files/Cog"
import { Cpu } from "~/expo/design/components/icons/files/Cpu"
import { DownTray } from "~/expo/design/components/icons/files/DownTray"
import { Ellipsis } from "~/expo/design/components/icons/files/Ellipsis"
import { Info } from "~/expo/design/components/icons/files/Info"
import { LockClosed } from "~/expo/design/components/icons/files/LockClosed"
import { Moon } from "~/expo/design/components/icons/files/Moon"
import { Newspaper } from "~/expo/design/components/icons/files/Newspaper"
import { Trash } from "~/expo/design/components/icons/files/Trash"
import { UpCircle } from "~/expo/design/components/icons/files/UpCircle"
import { Users } from "~/expo/design/components/icons/files/Users"
import { Xmark } from "~/expo/design/components/icons/files/Xmark"
import type { SvgProps } from "../Svg"

// Use relative imports instead of local to ensure icons are lazy loaded
// https://github.com/expo/expo/tree/master/packages/babel-preset-expo#lazyimports

const Icons = {
  Archive: () => Archive,
  ArrowRightDoor: () => ArrowRightDoor,
  ArrowUpSquare: () => ArrowUpSquare,
  Check: () => Check,
  ChevronRight: () => ChevronRight,
  Cloud: () => Cloud,
  CloudUp: () => CloudUp,
  Cog: () => Cog,
  Cpu: () => Cpu,
  DownTray: () => DownTray,
  Ellipsis: () => Ellipsis,
  Info: () => Info,
  LockClosed: () => LockClosed,
  Moon: () => Moon,
  Newspaper: () => Newspaper,
  Trash: () => Trash,
  UpCircle: () => UpCircle,
  Users: () => Users,
  Xmark: () => Xmark,
}

export type IconNames = keyof typeof Icons

interface Props extends SvgProps {
  name: IconNames
}

export const Icon: React.FC<Props> = ({ name, ...rest }) => {
  const Component = Icons[name]()
  return <Component {...rest} />
}

export const getIconNames = () => Object.keys(Icons) as Array<IconNames>
