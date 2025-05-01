"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, User } from "lucide-react"

interface BottomNavbarProps {
  activePage?: "home" | "calendar" | "profile"
}

export function BottomNavbar({ activePage }: BottomNavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href === "/dashboard" && activePage === "home")
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
