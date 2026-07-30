import React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'

type Props = {
  message: string
  type?: 'info' | 'success' | 'error'
  onClose?: () => void
}

export default function NotificationBar({ message, type = 'info', onClose }: Props) {
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-700'
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <Card className={`p-3 text-sm text-white ${bg} shadow-lg`}> 
        <div className="flex items-center justify-between gap-3">
          <div className="truncate">{message}</div>
          <div className="flex-shrink-0">
            <Button variant="ghost" onClick={onClose} size="sm">Dismiss</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
