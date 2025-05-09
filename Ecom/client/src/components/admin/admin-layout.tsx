import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { Sidebar } from "./sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 ml-8 md:ml-0">{title}</h1>
            <div className="flex items-center">
              <span className="mr-2 hidden sm:inline-block text-sm text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                {user.firstName?.[0] || 'A'}
                {user.lastName?.[0] || 'D'}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}