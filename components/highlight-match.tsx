export function HighlightMatch({ text, highlight }: HighlightMatchProps) {
  if (!highlight.trim() || !text) {
    return <>{text}</>
  }

  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escapedHighlight})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => {
        if (part && new RegExp(`^${escapedHighlight}$`, "gi").test(part)) {
          return (
            <span key={i} className="bg-yellow-200 text-black px-0.5 rounded">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

interface HighlightMatchProps {
  text: string
  highlight: string
}
