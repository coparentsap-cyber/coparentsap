import { ReactNode } from "react"

interface CardProps {
  title?: string
  children: ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4">
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h2>
      )}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
}
