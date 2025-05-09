import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import Footer from "./footer";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <h2 className="text-xl font-bold px-4 mb-6">Admin Panel</h2>
                <nav>
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`flex items-center px-4 py-2 my-1 text-sm rounded-md transition w-full text-left ${
                          location === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </button>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 p-5">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex items-center px-4 py-2 rounded-md transition w-full text-left ${
                    location === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center text-sm text-neutral-500">
              <Link href="/">
                <button className="hover:text-primary">Home</button>
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <Link href="/admin">
                <button className="hover:text-primary">Admin</button>
              </Link>
              {location !== "/admin" && (
                <>
                  <ChevronRight className="h-4 w-4 mx-2" />
                  <span className="text-neutral-900">
                    {navItems.find((item) => item.href === location)?.name || "Page"}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Page content */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
