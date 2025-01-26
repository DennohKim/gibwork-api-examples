"use client";
import Link from "next/link";
import { format } from "date-fns";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { TagFilter } from "@/components/tasks/TagFilter";
import { TaskList } from "@/components/tasks/TaskList";
import { Card, CardContent } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Search from "@/components/tasks/Search";
import { AVAILABLE_TAGS } from "@/lib/tags";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useInView } from "react-intersection-observer";

interface Task {
  id: string;
  title: string;
  createdAt: string;
  type: string;
  remainingAmount: number;
  deadline: string;
  tags: string[];
  status: string;
  asset: {
    symbol: string;
    imageUrl: string;
    reward: number;
  };
  user: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
  };
}

export default function TasksPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const sidebar = useStore(useSidebar, (x) => x);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useTasks();
  const { ref, inView } = useInView();
  const router = useRouter();

  const filteredTasks = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.map((page) => ({
      ...page,
      results: page.results.filter((task) => {
        if (selectedTags.length === 0) return true;
        return selectedTags.some((tag) => task.tags.includes(tag));
      }),
    }));
  }, [data?.pages, selectedTags]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (!sidebar) return null;

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (status === "pending") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Error loading tasks</h3>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  const hasFilteredTasks = filteredTasks.some(
    (page) => page.results.length > 0
  );

  return (
    <ContentLayout title="Tasks">
      <div className="sticky top-0 z-40 ">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search />
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded-md ${
                    viewType === "grid"
                      ? "bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded-md ${
                    viewType === "list"
                      ? "bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => router.push("/tasks/create")}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm font-normal">Create Task</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 pb-2 flex flex-wrap gap-2">
            {AVAILABLE_TAGS?.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => handleTagSelect(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <span className="ml-1">×</span>}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Card className="rounded-lg border-none mt-6">
        <CardContent className="p-0">
          <div className="h-[calc(100vh-280px)] overflow-y-auto">
            <div className="p-6">
              {!hasFilteredTasks ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">No tasks found</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTags.length > 0
                        ? "Try adjusting your filters"
                        : "Check back later for new tasks"}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    viewType === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredTasks.map((page, pageIndex) =>
                    page.results.map((task: Task) => (
                      <TaskCard
                        key={`${pageIndex}-${task.id}`}
                        viewType={viewType}
                        title={task.title}
                        createdAt={format(
                          new Date(task.createdAt),
                          "MMM dd, yyyy"
                        )}
                        reward={task.asset.reward}
                        symbol={task.asset.symbol}
                        imageUrl={task.asset.imageUrl}
                        firstName={task.user.firstName}
                        lastName={task.user.lastName}
                        username={task.user.username}
                        profilePicture={task.user.profilePicture}
                        tags={task.tags}
                        deadline={format(
                          new Date(task.deadline),
                          "MMM dd, yyyy"
                        )}
                        status={task.status}
                      />
                    ))
                  )}
                </div>
              )}

              <div ref={ref} className="mt-8 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-gray-500">
                      Loading more tasks...
                    </span>
                  </div>
                ) : hasNextPage ? (
                  <span className="text-sm text-gray-500">
                    Scroll for more
                  </span>
                ) : (
                  hasFilteredTasks && (
                    <span className="text-sm text-gray-500">
                      No more tasks to load
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
