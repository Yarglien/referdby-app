
interface LoadingErrorStateProps {
  isLoading: boolean;
  error: Error | null;
}

export const LoadingErrorState = ({ isLoading, error }: LoadingErrorStateProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground text-center mb-2">
          {error.message || "Please try refreshing the page or sign in again."}
        </p>
        <p className="text-sm text-muted-foreground">
          If the problem persists, please contact support.
        </p>
      </div>
    );
  }

  return null;
};
