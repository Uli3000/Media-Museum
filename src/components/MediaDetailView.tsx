import type React from "react"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMedia } from "../context/MediaContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Star, Pencil, Check, List, Tags, Film, Tv, Disc, ThumbsUp, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { TagManager } from "./TagManager"
import type { Tag, MediaType } from "@/types/media"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion } from "framer-motion"

const MediaDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getMediaById, updateMedia, updateSeasonStatus, deleteMedia } = useMedia()

  const media = getMediaById(id!)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [title, setTitle] = useState(media?.title || "")
  const [description, setDescription] = useState(media?.description || "")
  const [imageUrl, setImageUrl] = useState(media?.imageUrl || "")
  const [rating, setRating] = useState(media?.rating || null)
  const [inEmission, setInEmission] = useState(media?.inEmission || false)
  const [selectedTags, setSelectedTags] = useState<Tag[]>(media?.tags || [])
  const [mediaType, setMediaType] = useState<MediaType>(media?.type || "series")

  if (!media) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">No se encontró el contenido</h2>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    )
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleSeasonStatusChange = (seasonNumber: number, completed: boolean) => {
    const season = media.seasons.find((s) => s.number === seasonNumber)
    updateSeasonStatus(media.id, seasonNumber, completed, !completed, season?.rating)
  }

  const handleSeasonRating = (seasonNumber: number, rating: "good" | "bad") => {
    const season = media.seasons.find((s) => s.number === seasonNumber)
    // Toggle rating if it's already set to the same value
    const newRating = season?.rating === rating ? undefined : rating
    updateSeasonStatus(media.id, seasonNumber, season?.completed || false, season?.inProgress || false, newRating)
  }

  const handleSaveEdit = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    const updatedMedia = {
      ...media,
      title,
      description,
      imageUrl,
      rating,
      inEmission,
      tags: selectedTags,
      type: mediaType,
    }

    updateMedia(updatedMedia)
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteMedia(media.id)
    navigate("/")
  }

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
    <div className="container mx-auto py-8 page-transition">
      <Button variant="ghost" onClick={handleBack} className="mb-6 group transition-all">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image and Quick Info */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden h-full border shadow-sm hover:shadow-md transition-all">
            <div className="relative h-[400px]">
              <img
                src={media.imageUrl || "/placeholder.svg"}
                alt={media.title}
                className="object-cover w-full h-full"
              />

              <div className="absolute top-4 left-4">
                <Badge className={`px-3 py-1 border ${getTypeColor()}`}>{getTypeLabel()}</Badge>
              </div>

              {media.inEmission && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500">
                    En emisión
                  </Badge>
                </div>
              )}

              {media.isFavorite && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500">
                    <Star className="h-3 w-3 fill-yellow-500 mr-1" />
                    Favorito
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {media.rating !== null && (
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2" />
                  <span className="font-bold text-lg">{media.rating}/10</span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="w-full group hover:bg-primary/10 transition-colors"
              >
                <Pencil className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Editar
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details and Seasons */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{media.title}</h1>
            <p className="text-muted-foreground mb-4">{new Date(media.dateAdded).toLocaleDateString()}</p>
            <p className="text-lg mb-4">{media.description}</p>

            {/* Etiquetas */}
            {media.tags && media.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Tags className="h-4 w-4 mr-2" />
                  <h3 className="text-sm font-medium">Etiquetas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {media.type !== "movie" && (
            <div>
              <div className="flex items-center mb-4">
                <List className="mr-2" />
                <h2 className="text-xl font-bold">Temporadas</h2>
              </div>

              <div className="space-y-3">
                {media.seasons.map((season) => (
                  <motion.div
                    key={season.number}
                    className={`p-4 rounded-md flex items-center justify-between ${
                      season.completed
                        ? "bg-green-900/20 border border-green-800"
                        : season.inProgress
                          ? "bg-blue-900/20 border border-blue-800"
                          : "bg-secondary"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={season.completed}
                        onCheckedChange={(checked) => handleSeasonStatusChange(season.number, checked as boolean)}
                        className="mr-3"
                      />
                      <span>{season.title || `Temporada ${season.number}`}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rating buttons */}
                      <div className="flex items-center gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-7 w-7 rounded-full transition-colors ${season.rating === "good" ? "bg-green-900/30 text-green-400" : ""}`}
                          onClick={() => handleSeasonRating(season.number, "good")}
                          title="Me gustó"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-7 w-7 rounded-full transition-colors ${season.rating === "bad" ? "bg-red-900/30 text-red-400" : ""}`}
                          onClick={() => handleSeasonRating(season.number, "bad")}
                          title="No me gustó"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {season.completed && (
                        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      )}

                      {season.inProgress && !season.completed && (
                        <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
                          En proceso
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="destructive" onClick={handleDelete} className="transition-all hover:bg-red-600">
              Eliminar
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Editar {media.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="edit-image">URL de imagen</Label>
                <Input id="edit-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              <div>
                <Label>Tipo de contenido</Label>
                <RadioGroup
                  value={mediaType}
                  onValueChange={(value: MediaType) => setMediaType(value)}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="series" id="type-series" />
                    <Label htmlFor="type-series" className="flex items-center">
                      <Tv className="h-4 w-4 mr-2 text-media-series" />
                      Serie
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="type-movie" />
                    <Label htmlFor="type-movie" className="flex items-center">
                      <Film className="h-4 w-4 mr-2 text-media-movies" />
                      Película
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anime" id="type-anime" />
                    <Label htmlFor="type-anime" className="flex items-center">
                      <Disc className="h-4 w-4 mr-2 text-media-anime" />
                      Anime
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Etiquetas</Label>
                <TagManager selectedTags={selectedTags} onTagToggle={handleTagToggle} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                <Switch id="edit-emission" checked={inEmission} onCheckedChange={setInEmission} />
                <Label htmlFor="edit-emission">En emisión</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={handleSaveEdit} className="transition-all">
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MediaDetailView
