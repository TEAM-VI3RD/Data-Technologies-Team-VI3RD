interface Props {
  feature: string
}

export default function DevNotice({ feature }: Props) {
  return (
    <div className="border-2 border-dashed border-yellow-400 bg-yellow-50 text-yellow-800 rounded p-4 my-4 text-sm">
      <strong>[DEV]</strong> Nog niet geïmplementeerd: <em>{feature}</em>
    </div>
  )
}
