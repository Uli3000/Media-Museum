import Header from "../components/Header"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Film, Video, List, ChevronRight, Star, BarChart3 } from "lucide-react"
import { useMedia } from "@/context/MediaContext"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const Index = () => {
  const navigate = useNavigate()
  const { allMedia } = useMedia()

  const seriesCount = allMedia.filter((item) => item.type === "series").length
  const moviesCount = allMedia.filter((item) => item.type === "movie").length
  const animeCount = allMedia.filter((item) => item.type === "anime").length
  const favoritesCount = allMedia.filter((item) => item.isFavorite).length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const categories = [
    {
      title: "Series",
      icon: Video,
      description: "Organiza tus series favoritas y lleva un registro de sus temporadas.",
      path: "/series",
      color: "from-purple-800/80 to-indigo-900/80",
      textColor: "text-purple-400",
      borderColor: "border-media-series",
      count: seriesCount,
      gradient: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10",
    },
    {
      title: "Películas",
      icon: Film,
      description: "Crea una colección de tus películas favoritas con calificaciones personales.",
      path: "/movies",
      color: "from-pink-800/80 to-rose-900/80",
      textColor: "text-pink-400",
      borderColor: "border-media-movies",
      count: moviesCount,
      gradient: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
    },
    {
      title: "Anime",
      icon: List,
      description: "Mantén un seguimiento de tus animes y temporadas.",
      path: "/anime",
      color: "from-blue-800/80 to-sky-900/80",
      textColor: "text-blue-400",
      borderColor: "border-media-anime",
      count: animeCount,
      gradient: "bg-gradient-to-br from-blue-500/10 to-sky-500/10",
    },
  ]

  const recentMedia = [...allMedia]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
              Tu colección de medios favoritos.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Lleva un registro de tus series, películas y animes favoritos con calificaciones personalizadas y
              tu propio seguimiento.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/series")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Comenzar ahora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/stats")}>
                Ver estadísticas
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {allMedia.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-3xl font-bold">{allMedia.length}</span>
                  <span className="text-xs text-muted-foreground mt-1">elementos</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">Favoritos</span>
                  </div>
                  <span className="text-3xl font-bold">{favoritesCount}</span>
                  <span className="text-xs text-muted-foreground mt-1">elementos</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Más reciente</span>
                  <span className="text-xl font-bold truncate">
                    {allMedia.length > 0
                      ? allMedia.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0]
                          .title
                      : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">añadido recientemente</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Mejor calificado</span>
                  <span className="text-xl font-bold truncate">
                    {allMedia.filter((m) => m.rating !== null).length > 0
                      ? allMedia.filter((m) => m.rating !== null).sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
                          .title
                      : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">mayor puntuación</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4">Explora tu colección</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Organiza y gestiona todo tu contenido multimedia en un solo lugar, con herramientas personalizadas para
              cada tipo.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`rounded-xl border overflow-hidden shadow-sm ${category.gradient} backdrop-blur-sm`}
              >
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="mb-6 flex justify-between items-start">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                    >
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`${category.textColor} border-${category.borderColor.split("-").pop()}`}
                    >
                      {category.count} {category.count === 1 ? "elemento" : "elementos"}
                    </Badge>
                  </div>

                  <h3 className={`text-2xl font-bold mb-3 ${category.textColor}`}>{category.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{category.description}</p>

                  <Button onClick={() => navigate(category.path)} className="w-full mt-auto" variant="outline">
                    Explorar {category.title}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {recentMedia.length > 0 && (
        <section className="py-8 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-4">Añadidos recientemente</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Tus últimas adiciones a la colección</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {recentMedia.map((media, index) => {
                const MediaIcon = media.type === "series" ? Video : media.type === "movie" ? Film : List
                const mediaColor =
                  media.type === "series"
                    ? "text-media-series"
                    : media.type === "movie"
                      ? "text-media-movies"
                      : "text-media-anime"

                return (
                  <motion.div
                    key={media.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-card rounded-xl border overflow-hidden shadow-sm"
                    onClick={() => navigate(`/media/${media.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={media.imageUrl || "/placeholder.svg"}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 right-0">
                        <div className="flex justify-between items-center">
                          <Badge className={`${mediaColor} bg-${mediaColor.split("-").pop()}/20`}>
                            <MediaIcon className="h-3 w-3 mr-1" />
                            {media.type === "series" ? "Serie" : media.type === "movie" ? "Película" : "Anime"}
                          </Badge>
                          {media.rating !== null && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-xs text-white">{media.rating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate">{media.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Añadido el {new Date(media.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {allMedia.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => navigate("/series")}>
                  Ver toda la colección
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2025 MediaMuseum</p>
        </div>
      </footer>
    </div>
  )
}

export default Index
