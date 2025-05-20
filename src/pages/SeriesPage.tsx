import type React from "react"
import { useState } from "react"
import Header from "../components/Header"
import MediaCard from "../components/MediaCard"
import AddMediaForm from "../components/AddMediaForm"
import SearchAndFilter from "../components/SearchAndFilter"
import { useMedia } from "../context/MediaContext"
import type { Media } from "@/types/media"
import { motion } from "framer-motion"
import { Video } from "lucide-react"

const SeriesPage: React.FC = () => {
  const { getMediaByType } = useMedia()
  const allSeries = getMediaByType("series")
  const [filteredCount, setFilteredCount] = useState<number>(allSeries.length)
  const [filteredMedia, setFilteredMedia] = useState<Media[]>(allSeries)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <Video className="h-6 w-6 mr-2 text-media-series" />
            <h1 className="text-3xl font-bold">Series</h1>
          </div>
          <AddMediaForm />
        </motion.div>

        <SearchAndFilter mediaType="series" onSearchResults={setFilteredCount} onFilteredMedia={setFilteredMedia} />

        {filteredCount === 0 ? (
          <motion.div
            className="text-center py-12 bg-card/50 rounded-lg border border-dashed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xl text-muted-foreground mb-4">No hay resultados para tu búsqueda</p>
          </motion.div>
        ) : allSeries.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-card/50 rounded-lg border border-dashed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xl text-muted-foreground mb-4">No has añadido ninguna serie todavía</p>
            <AddMediaForm />
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredMedia.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MediaCard media={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default SeriesPage
