import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Flashcard({ front, back }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div 
      className="h-64 cursor-pointer perspective-1000"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div 
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 glass flex items-center justify-center p-6 backface-hidden">
          <p className="text-xl font-medium text-center">{front}</p>
        </div>
        
        <div 
          className="absolute inset-0 glass bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-6"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          <p className="text-xl text-center">{back}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}