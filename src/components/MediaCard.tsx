import type React from "react"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import type { Media } from "../types/media"
import { Star, Video, Film, List } from "lucide-react"
import { useMedia } from "../context/MediaContext"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface MediaCardProps {
  media: Media
}

const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const navigate = useNavigate() 
  const { toggleFavorite } = useMedia()

  const handleCardClick = () => {
    navigate(`/media/${media.id}`)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(media.id)
  }

  // Función para obtener el icono según el tipo de medio
  const getTypeIcon = () => {
    switch (media.type) {
      case "series":
        return <Video className="h-3 w-3 mr-1" />
      case "movie":
        return <Film className="h-3 w-3 mr-1" />
      case "anime":
        return <List className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  // Función para obtener el color según el tipo de medio
  const getTypeColor = () => {
    switch (media.type) {
      case "series":
        return "bg-media-series/20 text-media-series border-media-series"
      case "movie":
        return "bg-media-movies/20 text-media-movies border-media-movies"
      case "anime":
        return "bg-media-anime/20 text-media-anime border-media-anime"
      default:
        return "bg-primary/20 text-primary border-primary"
    }
  }

  // Función para obtener la etiqueta según el tipo de medio
  const getTypeLabel = () => {
    switch (media.type) {
      case "series":
        return "Serie"
      case "movie":
        return "Película"
      case "anime":
        return "Anime"
      default:
        return ""
    }
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className="overflow-hidden relative h-[320px] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
        onClick={handleCardClick}
      >
        <div className="relative h-full">
          <img src={media.imageUrl || "/placeholder.svg"} alt={media.title} className="object-cover w-full h-full" />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={`${getTypeColor()}`}>
              {getTypeIcon()}
              {getTypeLabel()}
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-transform hover:scale-110"
              aria-label={media.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`h-4 w-4 ${media.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="font-bold text-lg line-clamp-2 text-white">{media.title}</h3>

            <div className="flex items-center justify-between mt-2">
              {media.rating !== null && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm text-white">{media.rating}/10</span>
                </div>
              )}

              {media.tags && media.tags.length > 0 && (
                <div className="flex gap-1">
                  {media.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {media.tags.length > 2 && <span className="text-[10px] text-white">+{media.tags.length - 2}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default MediaCard
