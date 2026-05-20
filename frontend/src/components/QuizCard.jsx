import { useState } from 'react'
import { Clock, Trophy } from 'lucide-react'

export default function QuizCard({ quiz, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (index) => {
    setSelected(index)
    setShowResult(true)
    onAnswer(index === quiz.correct_answer)
  }

  return (
    <div className="glass p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{quiz.question}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          quiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
          quiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {quiz.difficulty}
        </span>
      </div>
      
      <div className="space-y-2">
        {quiz.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showResult && handleSelect(idx)}
            disabled={showResult}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              showResult && idx === quiz.correct_answer
                ? 'bg-green-500/20 border-green-500/50'
                : showResult && idx === selected && idx !== quiz.correct_answer
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            } ${selected === idx ? 'border-primary' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showResult && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-gray-300">{quiz.explanation}</p>
        </div>
      )}
    </div>
  )
}