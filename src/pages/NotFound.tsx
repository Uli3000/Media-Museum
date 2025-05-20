import { useLocation, Link } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FilmIcon, Home, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

const NotFound = () => {
  // Obtener la ubicación actual para registrar la ruta que causó el error
  const location = useLocation()

  useEffect(() => {
    console.error("404 Error: Usuario intentó acceder a una ruta inexistente:", location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-0 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                repeatDelay: 2,
              }}
              className="mb-4 bg-red-500/20 p-5 rounded-full"
            >
              <AlertTriangle size={50} className="text-red-500" />
            </motion.div>

            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500"
            >
              404
            </motion.h1>
          </CardHeader>

          <CardContent className="text-center pt-4">
            <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
            <p className="text-gray-300 mb-4">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>

            <div className="bg-gray-700/50 p-2 rounded-md text-sm font-mono text-gray-300 mb-4 overflow-x-auto">
              <code>{location.pathname}</code>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4 pb-6">
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              <Link to="/" className="flex items-center gap-2">
                <Home size={16} />
                Volver al inicio
              </Link>
            </Button>

            <Button asChild variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700/50">
              <Link to="/movies" className="flex items-center gap-2">
                <FilmIcon size={16} />
                Ver películas
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <FilmIcon className="text-purple-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              MediaMuseum
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
