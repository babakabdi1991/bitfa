import React, { ReactNode } from "react";

function HiddenElementForSeo({ children }: { children: ReactNode }) {
  // Make content visible to crawlers but styled minimally to not interfere with UI
  // This is better for SEO than hiding with CSS
  return (
    <div className="text-xs text-muted-foreground opacity-60 mt-4 mb-2">
      {children}
    </div>
  );
}

export default HiddenElementForSeo;
