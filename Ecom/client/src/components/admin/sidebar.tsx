import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  BarChart3Icon, 
  PackageIcon, 
  ShoppingCartIcon, 
  TagIcon, 
  UsersIcon, 
  LayersIcon,
  StarIcon,
  LogOutIcon,
  SettingsIcon,
  HomeIcon,
  MenuIcon,
  XIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3Icon },
  { name: "Manage Users", href: "/admin/users", icon: UsersIcon },
  { name: "Manage Products", href: "/admin/products", icon: PackageIcon },
  { name: "Manage Categories", href: "/admin/categories", icon: LayersIcon },
  { name: "Stock Management", href: "/admin/stock", icon: PackageIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },
  { name: "Reviews Management", href: "/admin/reviews", icon: StarIcon },
  { name: "Coupons & Discounts", href: "/admin/coupons", icon: TagIcon },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <span className="text-xl font-bold text-primary">O@N Shop Admin</span>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {/* Back to website link */}
          <Link
            href="/"
            className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <HomeIcon
              className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
              aria-hidden="true"
            />
            Back to Website
          </Link>
          
          {/* Navigation links */}
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOutIcon
            className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md bg-white p-2 text-gray-600 shadow-md hover:bg-gray-50 hover:text-gray-900"
        >
          {mobileMenuOpen ? (
            <XIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile sidebar backdrop - only visible on small screens when menu is open */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar - always visible on larger screens */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}