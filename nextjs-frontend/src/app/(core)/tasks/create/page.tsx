"use client";

import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Token {
  name: string;
  symbol: string;
  mintAddress: string;
  logoURI: string;
}

const SUPPORTED_TOKENS: Token[] = [
  {
    name: "Solana",
    symbol: "SOL",
    mintAddress: "So11111111111111111111111111111111111111112",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
];

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required").max(1000, "Content is too long"),
  requirements: z.string().min(1, "Requirements are required").max(1000, "Requirements are too long"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  payer: z
    .string()
    .min(1, "Payer address is required")
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address"),
  token: z.object({
    mintAddress: z.string().min(1, "Token is required"),
    amount: z.number()
      .positive("Amount must be positive")
      .min(0.000000001, "Amount must be at least 0.000000001")
      .refine((val) => val > 0, "Amount must be greater than 0")
  }),
});

type FormData = z.infer<typeof taskSchema>;

export const QUERY_KEYS = {
  tasks: ['tasks'] as const,
} as const;

export default function CreateCollectionPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      content: "",
      requirements: "",
      tags: [],
      payer: "",
      token: {
        mintAddress: "",
        amount: 0,
      },
    },
    mode: "onChange",
  });

  const watchedFields = watch();

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const loadingToastId = toast.loading('Creating task...');
      
      try {
        const response = await axios.post('https://api2.gib.work/tasks/public/transaction', data);
        toast.dismiss(loadingToastId);
        return response.data;
      } catch (error) {
        toast.dismiss(loadingToastId);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Task created successfully");
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      setShowSuccessDialog(true);
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      toast.error(
        error.response?.data?.message || 
        'Failed to create task. Please try again.'
      );
    },
  });

  const isFormValid = useMemo(() => {
    return (
      isValid &&
      selectedToken !== null &&
      watchedFields.title?.trim() !== "" &&
      watchedFields.content?.trim() !== "" &&
      watchedFields.requirements?.trim() !== "" &&
      watchedFields.payer?.trim() !== "" &&
      tags.length > 0 &&
      watchedFields.token.mintAddress !== "" &&
      watchedFields.token.amount > 0
    );
  }, [isValid, selectedToken, watchedFields, tags]);

  const isSubmitDisabled = 
    isSubmitting || 
    createTaskMutation.isPending ||
    !isFormValid;

  if (!sidebar) return null;

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput && !tags.includes(tagInput)) {
        const newTags = [...tags, tagInput];
        setTags(newTags);
        setValue("tags", newTags);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createTaskMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Error submitting form:", error);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessDialog(false);
    // Reset form
    setValue("title", "");
    setValue("content", "");
    setValue("requirements", "");
    setValue("tags", []);
    setValue("payer", "");
    setValue("token.mintAddress", "");
    setValue("token.amount", 0);
    setTags([]);
    setSelectedToken(null);
  };

  const handleViewTasks = () => {
    router.push('/tasks');
  };

  return (
    <ContentLayout title="Tasks">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tasks">Tasks</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Task</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-lg border-none mt-6">
        <CardContent className="p-0">
          <div className="h-full overflow-y-auto container py-4 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <span className="text-red-500">{errors.title.message}</span>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    className="h-[100px]"
                    placeholder="Content"
                    {...register("content")}
                  />
                  {errors.content && (
                    <span className="text-red-500">{errors.content.message}</span>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    className="h-[100px]"
                    placeholder="Requirements"
                    {...register("requirements")}
                  />
                  {errors.requirements && (
                    <span className="text-red-500">{errors.requirements.message}</span>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Add tags (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="payer">Payer</Label>
                  <Input
                    id="payer"
                    type="text"
                    placeholder="Solana wallet address"
                    {...register("payer")}
                  />
                  {errors.payer && (
                    <span className="text-red-500">{errors.payer.message}</span>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="token">Select Token</Label>
                  <Select
                    onValueChange={(value) => {
                      const token = SUPPORTED_TOKENS.find(
                        (t) => t.mintAddress === value
                      );
                      setSelectedToken(token || null);
                      setValue("token.mintAddress", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem
                          key={token.mintAddress}
                          value={token.mintAddress}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={token.logoURI}
                              alt={token.name}
                              className="w-4 h-4"
                            />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.token?.mintAddress && (
                    <span className="text-red-500">
                      {errors.token.mintAddress.message}
                    </span>
                  )}
                </div>

                {selectedToken && (
                  <div className="grid gap-3">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.000000001"
                      min="0.000000001"
                      placeholder={`Amount in ${selectedToken.symbol}`}
                      {...register("token.amount", {
                        valueAsNumber: true,
                        required: "Amount is required",
                        min: {
                          value: 0.000000001,
                          message: "Amount must be at least 0.000000001"
                        }
                      })}
                    />
                    {errors.token?.amount && (
                      <span className="text-red-500">
                        {errors.token.amount.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="w-fit"
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/tasks")}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isSubmitDisabled}
                    size="lg"
                    className="w-fit"
                    variant="default"
                    type="submit"
                  >
                    {(isSubmitting || createTaskMutation.isPending) && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting || createTaskMutation.isPending 
                      ? "Creating..." 
                      : "Create Task"
                    }
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>


<Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Task Created Successfully!</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Your task has been created. Would you like to create another task or view all tasks?
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={() => setShowSuccessDialog(false)}
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
            "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCreateAnother} className="flex-1 sm:flex-none">
            Create Another
          </Button>
          <Button onClick={handleViewTasks} className="flex-1 sm:flex-none">
            View Tasks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </ContentLayout>
  );
}
