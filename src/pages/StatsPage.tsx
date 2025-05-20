import type React from "react"
import { useState } from "react"
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import Header from "../components/Header"
import { useMedia } from "../context/MediaContext"
import type { MediaType } from "../types/media"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Film, Video, List, TagIcon } from "lucide-react"
import { motion } from "framer-motion"

const MEDIA_LABELS: Record<MediaType, string> = {
  series: "Series",
  movie: "Películas",
  anime: "Anime",
}

const MEDIA_COLORS: Record<MediaType, string> = {
  series: "#8B5CF6", // morado
  movie: "#EC4899", // rosa
  anime: "#3B82F6", // azul
}

const StatsPage: React.FC = () => {
  const { allMedia, allTags } = useMedia()
  const [activeTab, setActiveTab] = useState("overview")

  if (allMedia.length < 3) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Estadísticas</h1>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No hay suficientes datos</CardTitle>
              <CardDescription>
                Añade al menos 3 elementos a tu colección para ver estadísticas detalladas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="flex flex-col items-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-4 opacity-50"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 12l4-4 4 4 6-6" />
                </svg>
                <p>Actualmente tienes {allMedia.length} elementos en tu colección</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // 1. Media type distribution
  const typeData = Object.entries(
    allMedia.reduce((acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {}),
  ).map(([type, count]) => ({
    name: MEDIA_LABELS[type as MediaType] || type,
    value: count,
    color: MEDIA_COLORS[type as MediaType] || "#6B7280",
  }))

  // 2. Favorites distribution
  const favoriteData = [
    { name: "Favoritos", value: allMedia.filter((item) => item.isFavorite).length, color: "#FFD700" },
    { name: "No favoritos", value: allMedia.filter((item) => !item.isFavorite).length, color: "#6B7280" },
  ]

  // 3. Rating distribution
  const ratingRanges = [
    { range: "0-2", min: 0, max: 2, color: "#EF4444" },
    { range: "2-4", min: 2, max: 4, color: "#F59E0B" },
    { range: "4-6", min: 4, max: 6, color: "#FBBF24" },
    { range: "6-8", min: 6, max: 8, color: "#34D399" },
    { range: "8-10", min: 8, max: 10, color: "#10B981" },
  ]

  const ratingDistribution = ratingRanges.map((range) => {
    const count = allMedia.filter(
      (item) => item.rating !== null && item.rating >= range.min && item.rating <= range.max,
    ).length
    return {
      name: range.range,
      value: count,
      color: range.color,
    }
  })

  // 4. Tag statistics
  const tagStats = allTags
    .map((tag) => {
      const count = allMedia.filter((item) => item.tags.some((t) => t.id === tag.id)).length
      return {
        name: tag.name,
        value: count,
        color: tag.color,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 tags

  // 5. Season ratings (good vs bad)
  const seasonRatings = { good: 0, bad: 0, unrated: 0 }
  allMedia
    .filter((media) => media.type !== "movie")
    .forEach((media) => {
      media.seasons.forEach((season) => {
        if (season.rating === "good") seasonRatings.good++
        else if (season.rating === "bad") seasonRatings.bad++
        else seasonRatings.unrated++
      })
    })

  const seasonRatingData = [
    { name: "Me gustó", value: seasonRatings.good, color: "#10B981" },
    { name: "No me gustó", value: seasonRatings.bad, color: "#EF4444" },
    { name: "Sin calificar", value: seasonRatings.unrated, color: "#6B7280" },
  ]

  // 6. Media added over time (by month)
  const mediaByDate = allMedia.reduce((acc: Record<string, number>, item) => {
    const date = new Date(item.dateAdded)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
    acc[monthYear] = (acc[monthYear] || 0) + 1
    return acc
  }, {})

  // Sort by date
  const timelineData = Object.entries(mediaByDate)
    .map(([date, count]) => {
      const [month, year] = date.split("/")
      return {
        date,
        count,
        timestamp: new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).getTime(),
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      name: item.date,
      value: item.count,
    }))

  // 7. Top rated media
  const topRatedMedia = [...allMedia]
    .filter((item) => item.rating !== null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map((item) => ({
      name: item.title.length > 20 ? item.title.substring(0, 20) + "..." : item.title,
      value: item.rating || 0,
      type: item.type,
    }))

  // 8. Completion statistics
  const completionStats = allMedia
    .filter((media) => media.type !== "movie" && media.seasons.length > 0)
    .map((media) => {
      const totalSeasons = media.seasons.length
      const completedSeasons = media.seasons.filter((season) => season.completed).length
      const completionPercentage = Math.round((completedSeasons / totalSeasons) * 100)
      return {
        name: media.title.length > 15 ? media.title.substring(0, 15) + "..." : media.title,
        value: completionPercentage,
        completed: completedSeasons,
        total: totalSeasons,
        type: media.type,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu colección de medios</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-media-series/20 text-media-series border-media-series">
              <Video className="h-3 w-3 mr-1" />
              {allMedia.filter((m) => m.type === "series").length} Series
            </Badge>
            <Badge variant="outline" className="bg-media-movies/20 text-media-movies border-media-movies">
              <Film className="h-3 w-3 mr-1" />
              {allMedia.filter((m) => m.type === "movie").length} Películas
            </Badge>
            <Badge variant="outline" className="bg-media-anime/20 text-media-anime border-media-anime">
              <List className="h-3 w-3 mr-1" />
              {allMedia.filter((m) => m.type === "anime").length} Anime
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
            <TabsTrigger value="tags">Etiquetas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Distribución por tipo</CardTitle>
                    <CardDescription>Distribución de tu colección por tipo de medio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {typeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} elementos`, "Cantidad"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Favoritos</CardTitle>
                    <CardDescription>Elementos marcados como favoritos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={favoriteData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {favoriteData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} elementos`, "Cantidad"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Calificación de temporadas</CardTitle>
                    <CardDescription>Distribución de calificaciones de temporadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={seasonRatingData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {seasonRatingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} temporadas`, "Cantidad"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-sm">{seasonRatings.good}</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                        <span className="text-sm">{seasonRatings.bad}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Elementos añadidos por mes</CardTitle>
                  <CardDescription>Cronología de adiciones a tu colección</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} elementos`, "Añadidos"]} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#9B87F5"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de calificaciones</CardTitle>
                    <CardDescription>Distribución de calificaciones por rango</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratingDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip formatter={(value) => [`${value} elementos`, "Cantidad"]} />
                          <Bar dataKey="value" name="Elementos">
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Mejor calificados</CardTitle>
                    <CardDescription>Elementos con las calificaciones más altas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topRatedMedia}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis type="number" domain={[0, 10]} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value}/10`, "Calificación"]} />
                          <Bar dataKey="value" name="Calificación">
                            {topRatedMedia.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MEDIA_COLORS[entry.type as MediaType] || "#6B7280"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.3 }}
                className="md:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso de series y anime</CardTitle>
                    <CardDescription>Porcentaje de temporadas completadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={completionStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            formatter={(value, name, props) => {
                              if (name === "value") {
                                return [`${value}%`, "Completado"]
                              }
                              return [value, name]
                            }}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar dataKey="value" name="Porcentaje completado">
                            {completionStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MEDIA_COLORS[entry.type as MediaType] || "#6B7280"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mt-4">
                      {completionStats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                          <span className="text-sm font-medium">{stat.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {stat.completed}/{stat.total} temporadas
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Etiquetas más populares</CardTitle>
                  <CardDescription>Las etiquetas más utilizadas en tu colección</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tagStats}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => [`${value} elementos`, "Cantidad"]} />
                        <Bar dataKey="value" name="Elementos">
                          {tagStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Nube de etiquetas</CardTitle>
                  <CardDescription>Visualización de todas tus etiquetas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 py-4">
                    {allTags.map((tag) => {
                      const count = allMedia.filter((item) => item.tags.some((t) => t.id === tag.id)).length
                      const size = Math.max(1, Math.min(5, Math.ceil(count / (allMedia.length / 10))))
                      return (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="animate-fade-in"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: tag.color,
                            fontSize: `${0.75 + size * 0.1}rem`,
                            padding: `${0.25 + size * 0.1}rem ${0.5 + size * 0.1}rem`,
                          }}
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag.name} ({count})
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default StatsPage
