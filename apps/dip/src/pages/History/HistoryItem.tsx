import { useParams } from 'react-router-dom'

const HistoryItem = () => {
  const params = useParams()
  const historyId = params.historyId

  return (
    <div className="h-full p-6 flex flex-col relative">
      <div>历史记录：{historyId}</div>
    </div>
  )
}

export default HistoryItem
