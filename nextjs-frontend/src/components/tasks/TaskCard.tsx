interface TaskCardProps {
  viewType: 'grid' | 'list'
  title: string
  createdAt: string
  reward: number
  symbol: string
  imageUrl: string
  firstName: string
  lastName: string
  username: string
  profilePicture: string
  tags: string[]
  deadline: string
  status: string
}

export function TaskCard({
  viewType,
  title,
  createdAt,
  reward,
  symbol,
  imageUrl,
  firstName,
  lastName,
  username,
  profilePicture,
  tags,
  deadline,
  status
}: TaskCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${
      viewType === 'list' ? 'p-6' : 'overflow-hidden'
    }`}>
      <div className={viewType === 'list' 
        ? "flex items-center space-x-6"
        : "space-y-4 p-6"
      }>
        <div className={viewType === 'list' ? "flex-shrink-0 w-24 h-24" : "w-full"}>
          <img
            src={imageUrl}
            alt={symbol}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className={viewType === 'list' ? "flex-grow" : ""}>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="mt-2 flex items-center space-x-2">
            <img
              src={profilePicture}
              alt={username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-500">
              {firstName} {lastName}
            </span>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {reward} {symbol}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Due {deadline}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}