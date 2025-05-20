import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Film, Video, List, BarChartIcon as ChartBar } from "lucide-react"
import { cn } from "@/lib/utils"
import ImportExportData from "./ImportExportData"
import { motion } from "framer-motion"

const Header: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { name: "Series", path: "/series", icon: Video, color: "text-media-series" },
    { name: "Películas", path: "/movies", icon: Film, color: "text-media-movies" },
    { name: "Anime", path: "/anime", icon: List, color: "text-media-anime" },
    { name: "Estadísticas", path: "/stats", icon: ChartBar, color: "text-primary" },
  ]

  return (
    <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link
          to="/"
          className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
        >
          MediaMuseum
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 mx-1 rounded-md flex items-center transition-all relative group",
                    isActive
                      ? `font-medium ${item.color}`
                      : `text-muted-foreground hover:text-foreground hover:bg-accent/30`,
                  )}
                >
                  <item.icon className={cn("h-4 w-4 mr-2", isActive ? "opacity-100" : "opacity-70")} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      className={cn(
                        "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
                        item.path === "/series"
                          ? "bg-media-series"
                          : item.path === "/movies"
                            ? "bg-media-movies"
                            : item.path === "/anime"
                              ? "bg-media-anime"
                              : "bg-primary",
                      )}
                      layoutId="navbar-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
          <ImportExportData />
        </div>
      </div>
    </header>
  )
}

export default Header
