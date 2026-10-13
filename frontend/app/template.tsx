import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="animate-page-enter motion-reduce:animate-none">
      {children}
    </div>
  );
}