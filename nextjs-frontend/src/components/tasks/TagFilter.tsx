import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TagFilterProps {
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
}

export function TagFilter({ 
  availableTags, 
  selectedTags, 
  onTagSelect 
}: TagFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <span>
            {selectedTags?.length === 0
              ? "Filter by tags"
              : `${selectedTags?.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="end">
        {availableTags?.map((tag) => (
          <DropdownMenuItem
            key={tag}
            onClick={() => onTagSelect(tag)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{tag}</span>
            {selectedTags.includes(tag) && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}