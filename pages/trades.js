import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Trades() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since trades functionality is now consolidated there
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-darker">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
        <p className="text-muted-foreground">
          Trade management has been moved to the main dashboard for better user experience.
        </p>
      </div>
    </div>
  );
}
