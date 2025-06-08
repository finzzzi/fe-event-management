import React from "react";
import Link from "next/link";
import { Calendar, Tags, CreditCard, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      name: "Events",
      href: "/admin/event",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Promotions",
      href: "/admin/promotion",
      icon: <Tags className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      href: "/admin/transaction",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/admin/report",
      icon: <BarChart2 className="h-5 w-5" />,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between bg-gray-50 border-r">
      <div className="p-4">
        <div className="flex flex-col mb-8 px-3">
          {/* User Info Section */}
          {user && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span className="flex items-center justify-center">
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
