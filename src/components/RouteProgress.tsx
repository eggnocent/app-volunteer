import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export function RouteProgress() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const routeKey = `${location.pathname}${location.search}`

  if (prefersReducedMotion) {
    return null
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-24 bg-gradient-to-b from-background/80 to-transparent" />
        <motion.div
          className="absolute inset-x-0 top-0 h-1 origin-left bg-primary"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scaleX: [0, 0.46, 0.86, 1],
          }}
          transition={{
            duration: 0.82,
            times: [0, 0.2, 0.78, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
