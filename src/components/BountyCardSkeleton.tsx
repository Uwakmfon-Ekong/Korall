export default function BountyCardSkeleton() {
  return (
    <div className="bg-white border border-koral-100 rounded-xl p-5 flex flex-col gap-3.5 animate-pulse">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-0.5 h-16 bg-koral-100 rounded-sm shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-koral-100" />
            <div className="h-3 w-24 bg-koral-100 rounded-full" />
            <div className="h-4 w-12 bg-koral-100 rounded" />
          </div>
          <div className="h-4 w-4/5 bg-koral-100 rounded-full mb-1.5" />
          <div className="h-4 w-3/5 bg-koral-100 rounded-full" />
        </div>
        {/* Prize */}
        <div className="text-right shrink-0">
          <div className="h-2.5 w-10 bg-koral-100 rounded-full mb-1.5 ml-auto" />
          <div className="h-6 w-16 bg-koral-100 rounded-full mb-1 ml-auto" />
          <div className="h-2.5 w-8 bg-koral-100 rounded-full ml-auto" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-koral-100 rounded-full" />
        <div className="h-5 w-20 bg-koral-100 rounded-full" />
        <div className="h-5 w-14 bg-koral-100 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-koral-50">
        <div className="flex gap-4">
          <div className="h-3 w-20 bg-koral-100 rounded-full" />
          <div className="h-3 w-16 bg-koral-100 rounded-full" />
        </div>
        <div className="h-5 w-16 bg-koral-100 rounded-full" />
      </div>
    </div>
  );
}