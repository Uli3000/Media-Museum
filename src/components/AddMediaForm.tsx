import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Search, RefreshCw, Check } from "lucide-react"
import { useMedia } from "../context/MediaContext"
import type { MediaType } from "../types/media"
import { searchMedia, type TMDBSearchResult, getMediaDetails, getImageUrl } from "../services/tmdbApi"
import { useDebounce } from "../hooks/useDebounce"
import { TagManager, TagsAdminDialog } from "./TagManager"
import type { Tag } from "@/types/media"

const AddMediaForm: React.FC = () => {
  const { addMedia } = useMedia()
  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [type, setType] = useState<MediaType>("series")
  const [rating, setRating] = useState<number | null>(null)
  const [inEmission, setInEmission] = useState(false)
  const [seasonsCount, setSeasonsCount] = useState(1)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  // Estados para la búsqueda TMDB
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDebounce(searchQuery, 500)
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<TMDBSearchResult | null>(null)

  // Efecto para buscar cuando cambia la consulta
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 3) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchMedia(debouncedQuery)
        setSearchResults(results)
      } catch (error) {
        console.error("Error buscando:", error)
      } finally {
        setIsSearching(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // Función para seleccionar un resultado
  const handleSelectResult = async (result: TMDBSearchResult) => {
    setSelectedResult(result)
    setSearchQuery("") // Limpiar búsqueda

    if (result.media_type === "tv") {
      // Obtener detalles adicionales para series
      const details = await getMediaDetails(result.id, "tv")

      if (details) {
        setTitle(details.name || "")
        setDescription(details.overview)
        setImageUrl(getImageUrl(details.poster_path))
        setType("series")
        setRating(details.vote_average || null)
        setInEmission(details.in_production || false)
        setSeasonsCount(details.number_of_seasons || 1)
      }
    } else if (result.media_type === "movie") {
      // Configurar para películas
      setTitle(result.title || "")
      setDescription(result.overview)
      setImageUrl(getImageUrl(result.poster_path))
      setType("movie")
      setRating(result.vote_average || null)
      setInEmission(false)
      setSeasonsCount(1)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImageUrl("")
    setType("series")
    setRating(null)
    setInEmission(false)
    setSeasonsCount(1)
    setSelectedTags([])
    setSearchQuery("")
    setSearchResults([])
    setSelectedResult(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const seasons = Array.from({ length: seasonsCount }, (_, i) => ({
      number: i + 1,
      title: `Temporada ${i + 1}`,
      completed: false,
      inProgress: false,
    }))

    addMedia({
      title,
      description,
      imageUrl,
      type,
      rating,
      isFavorite: false,
      inEmission,
      seasons,
      tags: selectedTags,
    })

    resetForm()
    setOpen(false)
  }

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id)
      if (isSelected) {
        return prev.filter((t) => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all">
          <Plus className="h-5 w-5" />
          Añadir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir nuevo contenido</DialogTitle>
        </DialogHeader>

        {/* Sección de búsqueda TMDB */}
        <div className=" border-b pb-4">
          <Label htmlFor="tmdb-search">Buscar en TMDB</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="tmdb-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca una película, serie o anime..."
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto rounded-md border bg-popover p-1 shadow-md">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:bg-accent"
                  onClick={() => handleSelectResult(result)}
                >
                  {result.poster_path ? (
                    <img
                      src={getImageUrl(result.poster_path, "w92") || "/placeholder.svg"}
                      alt={result.title || result.name}
                      className="h-16 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-12 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Sin imagen</span>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{result.title || result.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.media_type === "movie" ? "Película" : "Serie"}
                      {result.release_date && ` • ${result.release_date.split("-")[0]}`}
                      {result.first_air_date && ` • ${result.first_air_date.split("-")[0]}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedResult && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary/20 p-2">
              <img
                src={getImageUrl(selectedResult.poster_path, "w92") || "/placeholder.svg"}
                alt={selectedResult.title || selectedResult.name}
                className="h-16 w-12 rounded object-cover"
              />
              <div>
                <div className="font-medium">{selectedResult.title || selectedResult.name}</div>
                <div className="text-xs text-muted-foreground">
                  Datos cargados de TMDB
                  <Check className="ml-1 inline h-3 w-3 text-green-500" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedResult(null)}>
                Limpiar
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(value: MediaType) => setType(value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="series">Serie</SelectItem>
                    <SelectItem value="movie">Película</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">URL de imagen</Label>
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enlace a la imagen"
                />
              </div>

              {type !== "movie" && (
                <div>
                  <Label htmlFor="seasons">Número de temporadas</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="seasons"
                      type="number"
                      min={1}
                      value={seasonsCount}
                      onChange={(e) => setSeasonsCount(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Etiquetas</Label>
                  <TagsAdminDialog />
                </div>
                <TagManager selectedTags={selectedTags} onTagToggle={handleTagToggle} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe una descripción"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Tu calificación ({rating !== null ? rating : "-"}/10)</Label>
                <Slider
                  value={rating !== null ? [rating] : [5]}
                  min={0}
                  max={10}
                  step={0.5}
                  onValueChange={(value) => setRating(value[0])}
                  className="my-4"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="emission" checked={inEmission} onCheckedChange={setInEmission} />
                <Label htmlFor="emission">En emisión</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMediaForm
