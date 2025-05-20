const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Tipos para los resultados de la API
export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string; // Para series
  poster_path: string | null;
  overview: string;
  first_air_date?: string; // Para series
  release_date?: string; // Para películas
  media_type: "movie" | "tv";
  vote_average: number;
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[];
  total_results: number;
  total_pages: number;
}

interface TMDBDetailsResponse {
  id: number;
  name?: string; // Para series
  title?: string; // Para películas
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons?: number; // Solo para series
  in_production?: boolean; // Solo para series
  status: string;
  seasons?: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }[];
}

// Objeto de opciones para fetch con los headers necesarios
const fetchOptions = {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
};

export const searchMedia = async (query: string): Promise<TMDBSearchResult[]> => {
  if (!query || query.trim() === "") return [];
  
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=es-ES`,
      fetchOptions
    );
    
    if (!response.ok) {
      console.error('Error en respuesta TMDB:', await response.text());
      throw new Error("Error en la búsqueda");
    }
    
    const data: TMDBSearchResponse = await response.json();
    
    // Filtramos solo por películas y series
    return data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );
  } catch (error) {
    console.error("Error buscando en TMDB:", error);
    return [];
  }
};

export const getMediaDetails = async (
  id: number,
  mediaType: "movie" | "tv"
): Promise<TMDBDetailsResponse | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${mediaType}/${id}?language=es-ES`,
      fetchOptions
    );
    
    if (!response.ok) {
      console.error('Error en respuesta detalles TMDB:', await response.text());
      throw new Error(`Error obteniendo detalles de ${mediaType}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo detalles de ${mediaType}:`, error);
    return null;
  }
};

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
