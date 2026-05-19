// No longer needed — admin route protection is handled by Next.js middleware.
// Kept as a passthrough for backward compatibility with any remaining imports.
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
