import { useInfiniteQuery } from '@tanstack/react-query'

interface Task {
  id: string
  title: string
  createdAt: string
  type: string
  remainingAmount: number
  deadline: string
  tags: string[]
  status: string
  asset: {
    symbol: string
    imageUrl: string
    reward: number
  }
  user: {
    firstName: string
    lastName: string
    username: string
    profilePicture: string
  }
}

interface TasksResponse {
  lastPage: number
  page: number
  limit: number
  total: number
  results: Task[]
}

interface UseTasksProps {
  selectedTags?: string[]
}

const fetchTasks = async ({ pageParam = 1, selectedTags }: { pageParam: number, selectedTags?: string[] }) => {
  let url = `https://api2.gib.work/explore?page=${pageParam}`
  
  // Add tags to query params if they exist
  if (selectedTags && selectedTags.length > 0) {
    url += `&tags=${selectedTags.join(',')}`
  }

  const response = await fetch(url, {
    headers: {
      'x-api-key': 'tzLZaE3NcODRboRhSaQ17yZsxK6olBk9hNdTZhK5'
    }
  })
  return response.json()
}

export function useTasks({ selectedTags }: UseTasksProps = {}) {
  return useInfiniteQuery<TasksResponse>({
    queryKey: ['tasks', { selectedTags }],
    queryFn: ({ pageParam }) => fetchTasks({ pageParam, selectedTags }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.lastPage) {
        return lastPage.page + 1
      }
      return undefined
    }
  })
}