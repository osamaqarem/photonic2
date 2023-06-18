import React from "react"

import { Archive } from "src/design/components/icons/archive"
import { ArrowRightDoor } from "src/design/components/icons/arrow-right-door"
import { ArrowUpSquare } from "src/design/components/icons/arrow-up-square"
import { Check } from "src/design/components/icons/check"
import { ChevronRight } from "src/design/components/icons/chevron-right"
import { Cloud } from "src/design/components/icons/cloud"
import { CloudUp } from "src/design/components/icons/cloud-up"
import { Cog } from "src/design/components/icons/cog"
import { Cpu } from "src/design/components/icons/cpu"
import { DownTray } from "src/design/components/icons/down-tray"
import { Ellipsis } from "src/design/components/icons/ellipsis"
import { Info } from "src/design/components/icons/info"
import { LockClosed } from "src/design/components/icons/lock-closed"
import { Moon } from "src/design/components/icons/moon"
import { Newspaper } from "src/design/components/icons/newspaper"
import { Trash } from "src/design/components/icons/trash"
import { UpCircle } from "src/design/components/icons/up-circle"
import { Users } from "src/design/components/icons/users"
import { Xmark } from "src/design/components/icons/x-mark"
import type { SvgProps } from "../svg"

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
