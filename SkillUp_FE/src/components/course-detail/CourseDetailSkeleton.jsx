// src/components/course-detail/CourseDetailSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-48 bg-gray-700" />
              <Skeleton className="h-16 w-full bg-gray-700" />
              <Skeleton className="h-8 w-3/4 bg-gray-700" />
              <Skeleton className="h-12 w-64 bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}