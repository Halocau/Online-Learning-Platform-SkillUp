import { memo } from "react";

const CourseSkeleton = memo(() => (
    <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-200"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    </div>
));

CourseSkeleton.displayName = "CourseSkeleton";

export default CourseSkeleton;

