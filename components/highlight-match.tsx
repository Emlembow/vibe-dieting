interface HighlightMatchProps {
  text: string
  highlight: string
}

export function HighlightMatch({ text, highlight }: HighlightMatchProps) {
  if (!highlight.trim() || !text) {
    return <>{text}</>
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-black px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
