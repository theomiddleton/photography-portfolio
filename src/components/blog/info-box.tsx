import react from 'react'

export const InfoBox = react.forwardRef<HTMLDivElement, { title: string, children: React.ReactNode }>((props, ref) => {
  return (
    <div ref={ref} className="p-4 bg-gray-50 rounded-lg my-2">
      <h4 className="font-bold">{props.title}</h4>
      {props.children}
    </div>
  )
})