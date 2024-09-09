// @ts-nocheck

import { motion } from 'framer-motion'

export default function ErrorInput({
  top,
  right,
  value,
  fontSize,
  color,
  borderRadius,
  transitionTime,
  px,
  py,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0,
      }}
      style={{
        top: `${top}`,
        right: `${right}`,
        transform: 'translateX(-50%)',
        color: color,
        minWidth: '200px',
        textAlign: 'center',
        paddingTop: `${py}`,
        paddingBottom: `${py}`,
        paddingRight: `${px}`,
        paddingLeft: `${px}`,
        fontSize: fontSize,
        borderRadius: borderRadius,
        backgroundColor: 'rgb(239 68 68)',
      }}
      className="absolute z-50 shadow-sm"
    >
      {value}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '20%',
          transform: 'translateX(-50%)',
          borderWidth: '11px',
          borderStyle: 'solid',
          borderColor: 'rgb(239 68 68) transparent transparent transparent',
        }}
      ></div>
    </motion.div>
  )
}
