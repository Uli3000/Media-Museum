import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Media, MediaType, Tag } from "../types/media"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

interface MediaContextProps {
  allMedia: Media[]
  addMedia: (media: Omit<Media, "id" | "dateAdded">) => void
  updateMedia: (media: Media) => void
  deleteMedia: (id: string) => void
  getMediaById: (id: string) => Media | undefined
  toggleFavorite: (id: string) => void
  updateSeasonStatus: (
    mediaId: string,
    seasonNumber: number,
    completed: boolean,
    inProgress: boolean,
    rating?: "good" | "bad",
  ) => void
  getMediaByType: (type: MediaType) => Media[]
  allTags: Tag[]
  addTag: (name: string, color: string) => Tag
  deleteTag: (id: string) => void
  updateTag: (tag: Tag) => void
  addTagToMedia: (mediaId: string, tagId: string) => void
  removeTagFromMedia: (mediaId: string, tagId: string) => void
}

const MediaContext = createContext<MediaContextProps | undefined>(undefined)

const STORAGE_KEY = "media-tracker-data"
const TAGS_STORAGE_KEY = "media-tracker-tags"

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allMedia, setAllMedia] = useState<Media[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        const processedData = parsedData.map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded),
          tags: item.tags || [],
        }))
        setAllMedia(processedData)
      } catch (error) {
        console.error("Failed to parse saved data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos guardados",
          variant: "destructive",
        })
      }
    }

    // Cargar etiquetas
    const savedTags = localStorage.getItem(TAGS_STORAGE_KEY)
    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags)
        setAllTags(parsedTags)
      } catch (error) {
        console.error("Failed to parse saved tags:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMedia))
  }, [allMedia])

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(allTags))
  }, [allTags])

  const addMedia = (mediaData: Omit<Media, "id" | "dateAdded">) => {
    const newMedia: Media = {
      ...mediaData,
      id: uuidv4(),
      dateAdded: new Date(),
      tags: mediaData.tags || [], // Asegurar que se inicializa con un array de etiquetas
    }

    setAllMedia((prev) => [...prev, newMedia])

    toast({
      title: "Añadido",
      description: `${mediaData.title} ha sido añadido a tu colección`,
    })
  }

  const updateMedia = (updatedMedia: Media) => {
    setAllMedia((prev) => prev.map((media) => (media.id === updatedMedia.id ? updatedMedia : media)))

    toast({
      title: "Actualizado",
      description: `${updatedMedia.title} ha sido actualizado`,
    })
  }

  const deleteMedia = (id: string) => {
    const mediaToDelete = allMedia.find((m) => m.id === id)
    setAllMedia((prev) => prev.filter((media) => media.id !== id))

    if (mediaToDelete) {
      toast({
        title: "Eliminado",
        description: `${mediaToDelete.title} ha sido eliminado`,
      })
    }
  }

  const getMediaById = (id: string) => {
    return allMedia.find((media) => media.id === id)
  }

  const toggleFavorite = (id: string) => {
    setAllMedia((prev) =>
      prev.map((media) => {
        if (media.id === id) {
          return {
            ...media,
            isFavorite: !media.isFavorite,
          }
        }
        return media
      }),
    )
  }

  const updateSeasonStatus = (
    mediaId: string,
    seasonNumber: number,
    completed: boolean,
    inProgress: boolean,
    rating?: "good" | "bad",
  ) => {
    setAllMedia((prev) =>
      prev.map((media) => {
        if (media.id === mediaId) {
          const updatedSeasons = media.seasons.map((season) => {
            if (season.number === seasonNumber) {
              return {
                ...season,
                completed,
                inProgress,
                rating: rating !== undefined ? rating : season.rating,
              }
            }
            return season
          })

          return {
            ...media,
            seasons: updatedSeasons,
          }
        }
        return media
      }),
    )
  }

  const getMediaByType = (type: MediaType) => {
    return allMedia.filter((media) => media.type === type)
  }

  const addTag = (name: string, color: string): Tag => {
    const newTag: Tag = {
      id: uuidv4(),
      name,
      color,
    }

    setAllTags((prev) => [...prev, newTag])

    toast({
      title: "Etiqueta creada",
      description: `La etiqueta "${name}" ha sido creada`,
    })

    return newTag
  }

  const deleteTag = (id: string) => {
    const tagToDelete = allTags.find((t) => t.id === id)

    // Eliminar la etiqueta de todos los medios
    setAllMedia((prev) =>
      prev.map((media) => ({
        ...media,
        tags: media.tags.filter((tag) => tag.id !== id),
      })),
    )

    // Eliminar la etiqueta
    setAllTags((prev) => prev.filter((tag) => tag.id !== id))

    if (tagToDelete) {
      toast({
        title: "Etiqueta eliminada",
        description: `La etiqueta "${tagToDelete.name}" ha sido eliminada`,
      })
    }
  }

  const updateTag = (updatedTag: Tag) => {
    // Actualizar la etiqueta
    setAllTags((prev) => prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)))

    // Actualizar la etiqueta en todos los medios que la tengan
    setAllMedia((prev) =>
      prev.map((media) => ({
        ...media,
        tags: media.tags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
      })),
    )

    toast({
      title: "Etiqueta actualizada",
      description: `La etiqueta "${updatedTag.name}" ha sido actualizada`,
    })
  }

  const addTagToMedia = (mediaId: string, tagId: string) => {
    const media = getMediaById(mediaId)
    const tag = allTags.find((t) => t.id === tagId)

    if (!media || !tag) return

    // Verificar si el medio ya tiene la etiqueta
    if (media.tags.some((t) => t.id === tagId)) return

    setAllMedia((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          return {
            ...m,
            tags: [...m.tags, tag],
          }
        }
        return m
      }),
    )

    toast({
      title: "Etiqueta añadida",
      description: `La etiqueta "${tag.name}" ha sido añadida a "${media.title}"`,
    })
  }

  const removeTagFromMedia = (mediaId: string, tagId: string) => {
    const media = getMediaById(mediaId)
    const tag = allTags.find((t) => t.id === tagId)

    if (!media || !tag) return

    setAllMedia((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          return {
            ...m,
            tags: m.tags.filter((t) => t.id !== tagId),
          }
        }
        return m
      }),
    )

    toast({
      title: "Etiqueta eliminada",
      description: `La etiqueta "${tag.name}" ha sido eliminada de "${media.title}"`,
    })
  }

  return (
    <MediaContext.Provider
      value={{
        allMedia,
        addMedia,
        updateMedia,
        deleteMedia,
        getMediaById,
        toggleFavorite,
        updateSeasonStatus,
        getMediaByType,
        allTags,
        addTag,
        deleteTag,
        updateTag,
        addTagToMedia,
        removeTagFromMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  )
}

export const useMedia = () => {
  const context = useContext(MediaContext)
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider")
  }
  return context
}
