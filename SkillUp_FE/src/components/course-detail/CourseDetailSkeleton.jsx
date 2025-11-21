// src/components/course-detail/CourseDetailSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Hero Skeleton */}
      <section className="border-b border-[#272343]/10 bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-5">
              <Skeleton className="h-6 w-48 bg-[#e3f6f5]" />
              <Skeleton className="h-16 w-full bg-[#e3f6f5]" />
              <Skeleton className="h-12 w-3/4 bg-[#e3f6f5]" />
              <Skeleton className="h-8 w-64 bg-[#e3f6f5]" />
            </div>
            <Skeleton className="h-96 w-full bg-[#e3f6f5] rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="bg-[#fffffe]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-10">
              <Skeleton className="h-64 w-full bg-[#e3f6f5] rounded-2xl" />
              <Skeleton className="h-96 w-full bg-[#e3f6f5] rounded-2xl" />
              <Skeleton className="h-48 w-full bg-[#e3f6f5] rounded-2xl" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-64 w-full bg-[#e3f6f5] rounded-2xl" />
              <Skeleton className="h-32 w-full bg-[#e3f6f5] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}