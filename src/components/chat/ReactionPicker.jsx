import { useState } from 'react'

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function ReactionPicker({ onSelect, onClose }) {
  return (
    <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
      <div className="flex gap-1">
        {EMOJI_LIST.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <span className="text-lg">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}