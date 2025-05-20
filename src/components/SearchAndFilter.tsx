import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Search, Tags, Star, SlidersHorizontal, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useMedia } from "@/context/MediaContext"
import { useNavigate } from "react-router-dom"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import type { Tag, Media } from "@/types/media"
import { motion } from "framer-motion"

interface SearchAndFilterProps {
  mediaType?: "series" | "movie" | "anime"
  onSearchResults?: (count: number) => void
  onFilteredMedia?: (media: Media[]) => void
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ mediaType, onSearchResults, onFilteredMedia }) => {
  const { allMedia, allTags } = useMedia()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [ratingFilter, setRatingFilter] = useState([0, 10])
  const [filteredMediaItems, setFilteredMediaItems] = useState<Media[]>([])
  const navigate = useNavigate()

  // Memoizamos la función de filtrado para evitar recálculos innecesarios
  const filterMedia = useCallback(() => {
    return allMedia.filter((item) => {
      const typeMatch = mediaType ? item.type === mediaType : true

      const searchMatch = searchTerm
        ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true

      const favoriteMatch = filterFavorites ? item.isFavorite : true

      const tagMatch =
        selectedTags.length === 0
          ? true
          : selectedTags.every((tag) => item.tags.some((itemTag) => itemTag.id === tag.id))

      const ratingMatch =
        item.rating !== null
          ? item.rating >= ratingFilter[0] && item.rating <= ratingFilter[1]
          :
            ratingFilter[0] === 0

      return typeMatch && searchMatch && favoriteMatch && tagMatch && ratingMatch
    })
  }, [allMedia, mediaType, searchTerm, filterFavorites, selectedTags, ratingFilter])

  // Efecto para actualizar los resultados filtrados cuando cambian los criterios de filtrado
  useEffect(() => {
    const filtered = filterMedia()
    setFilteredMediaItems(filtered)

    // Notificar a los componentes padres sobre los resultados
    if (onSearchResults) {
      onSearchResults(filtered.length)
    }

    if (onFilteredMedia) {
      onFilteredMedia(filtered)
    }
  }, [filterMedia, onSearchResults, onFilteredMedia])

  const handleItemClick = (id: string) => {
    navigate(`/media/${id}`)
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id)
      if (isSelected) {
        return prev.filter((t) => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterFavorites(false)
    setSelectedTags([])
    setRatingFilter([0, 10])
  }

  const hasActiveFilters =
    searchTerm || filterFavorites || selectedTags.length > 0 || ratingFilter[0] > 0 || ratingFilter[1] < 10

  return (
    <motion.div
      className="mb-6 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-input focus-visible:ring-1 transition-all"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterFavorites ? "default" : "outline"}
            onClick={() => setFilterFavorites(!filterFavorites)}
            className="whitespace-nowrap transition-all"
            size="sm"
          >
            <Star className="h-4 w-4 mr-2" fill={filterFavorites ? "currentColor" : "none"} />
            Favoritos
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={selectedTags.length > 0 ? "default" : "outline"}
                className="whitespace-nowrap transition-all"
                size="sm"
              >
                <Tags className="h-4 w-4 mr-2" />
                Etiquetas {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 backdrop-blur-sm border shadow-md">
              <h4 className="font-medium mb-2">Filtrar por etiquetas</h4>

              {allTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay etiquetas disponibles</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4 max-h-[200px] overflow-y-auto p-1">
                  {allTags.map((tag) => {
                    const isSelected = selectedTags.some((t) => t.id === tag.id)
                    return (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer transition-all hover:scale-105"
                        style={{
                          backgroundColor: isSelected ? `${tag.color}20` : "transparent",
                          color: tag.color,
                          borderColor: tag.color,
                        }}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag.name}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    )
                  })}
                </div>
              )}

              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedTags([])}>
                  Limpiar selección
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={ratingFilter[0] > 0 || ratingFilter[1] < 10 ? "default" : "outline"}
                className="whitespace-nowrap transition-all"
                size="sm"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Puntuación {(ratingFilter[0] > 0 || ratingFilter[1] < 10) && `(${ratingFilter[0]}-${ratingFilter[1]})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 backdrop-blur-sm border shadow-md">
              <h4 className="font-medium mb-2">Filtrar por puntuación</h4>

              <div className="space-y-6 py-2">
                <div>
                  <Slider
                    value={ratingFilter}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={setRatingFilter}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {ratingFilter[0]}</span>
                    <span>Max: {ratingFilter[1]}</span>
                  </div>
                </div>

                {(ratingFilter[0] > 0 || ratingFilter[1] < 10) && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setRatingFilter([0, 10])}>
                    Restablecer
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters} className="whitespace-nowrap" size="sm">
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer flex items-center transition-all hover:scale-105"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: tag.color,
              }}
              onClick={() => toggleTag(tag)}
            >
              {tag.name}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </motion.div>
      )}

      {searchTerm && filteredMediaItems.length > 0 && (
        <motion.div
          className="bg-card border rounded-md shadow-sm max-h-60 overflow-y-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {filteredMediaItems.map((item) => (
            <div
              key={item.id}
              className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center gap-2 transition-colors"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="w-10 h-10 rounded overflow-hidden">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 ml-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{item.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {item.isFavorite && <Star className="ml-auto h-4 w-4 text-yellow-500 fill-yellow-500" />}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default SearchAndFilter