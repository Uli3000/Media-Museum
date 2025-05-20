export type MediaType = "series" | "movie" | "anime"

export type Season = {
  number: number
  title?: string
  completed: boolean
  inProgress?: boolean
  rating?: "good" | "bad"
}

export type Tag = {
  id: string
  name: string
  color: string
}

export interface Media {
  id: string
  type: MediaType
  title: string
  description: string
  imageUrl: string
  rating: number | null
  isFavorite: boolean
  seasons: Season[]
  inEmission: boolean
  dateAdded: Date
  tags: Tag[]
}
