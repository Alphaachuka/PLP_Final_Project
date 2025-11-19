import UpliftLogo from "./UpliftLogo";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <UpliftLogo to="" size="lg" showText={false} />
        <div className="flex flex-col items-center gap-2">
          <div className="h-1 w-48 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[slide-in-right_1.5s_ease-in-out_infinite]" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
