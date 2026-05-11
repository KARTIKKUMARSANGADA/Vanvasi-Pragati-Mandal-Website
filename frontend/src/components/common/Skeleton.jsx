import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200 rounded ${className}`}
      {...props}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full">
    <Skeleton className="h-56 w-full rounded-none" />
    <div className="p-6 flex-grow flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="pt-6 border-t border-slate-100 mt-auto">
        <Skeleton className="h-5 w-1/3 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ProjectDetailSkeleton = () => (
  <div className="w-full pb-24">
    <Skeleton className="h-[70vh] w-full" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="space-y-4 flex-grow">
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-48 rounded-2xl shrink-0" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <div className="pt-8 grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Default export to prevent import errors
export default Skeleton;
