import React from "react"

// Self clearing interval ref
export const useSafeIntervalRef = () => {
  const ref = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(ref.current)
      }
    }
  }, [])

  return ref
}
