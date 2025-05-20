import type React from "react"
import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMedia } from "@/context/MediaContext"
import { useToast } from "@/hooks/use-toast"
import { FileUp, FileDown, CheckSquare, Square } from "lucide-react"
import type { Media } from "@/types/media"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const ImportExportData: React.FC = () => {
  const { allMedia, addMedia } = useMedia()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [fileName, setFileName] = useState(`mediatracker-export-${new Date().toISOString().split("T")[0]}`)
  const [open, setOpen] = useState(false)

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      setSelectedItems(allMedia.map((item) => item.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        const newSelection = prev.filter((itemId) => itemId !== id)
        setSelectAll(false)
        return newSelection
      } else {
        const newSelection = [...prev, id]
        setSelectAll(newSelection.length === allMedia.length)
        return newSelection
      }
    })
  }

  const handleExportData = () => {
    try {
      if (selectedItems.length === 0) {
        toast({
          title: "No hay elementos seleccionados",
          description: "Por favor, selecciona al menos un elemento para exportar.",
          variant: "destructive",
        })
        return
      }

      const dataToExport = allMedia.filter((item) => selectedItems.includes(item.id))

      const dataStr = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([dataStr], { type: "application/json" })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${fileName.trim() || "mediatracker-export"}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportado con éxito",
        description: `Se han exportado ${dataToExport.length} elementos.`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as Media[]

        if (!Array.isArray(importedData)) {
          throw new Error("El formato de los datos no es válido")
        }

        const isValidData = importedData.every(
          (item) => item.id && item.title && item.type && Array.isArray(item.seasons),
        )

        if (!isValidData) {
          throw new Error("Algunos elementos no tienen el formato correcto")
        }

        importedData.forEach((item) => {
          const { id, dateAdded, ...mediaData } = item
          addMedia({
            ...mediaData,
            id,
            dateAdded: new Date(dateAdded),
          } as any)
        })

        toast({
          title: "Importado con éxito",
          description: `Se han importado ${importedData.length} elementos.`,
        })
      } catch (error) {
        console.error("Error importing data:", error)
        toast({
          title: "Error",
          description: "El archivo seleccionado no tiene un formato válido.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Importar/Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar o Exportar datos</DialogTitle>
          <DialogDescription>
            Exporta tu colección para hacer una copia de seguridad o importa una colección previamente guardada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Exportar datos</h3>

            {allMedia.length > 0 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="export-filename" className="text-sm font-medium">
                    Nombre del archivo
                  </label>
                  <Input
                    id="export-filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Nombre del archivo de exportación"
                    className="mb-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      {selectAll ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                      {selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
                    </button>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {selectedItems.length} de {allMedia.length} seleccionados
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
                    {allMedia.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 py-1 border-b last:border-0">
                        <Checkbox
                          id={`export-item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                        <label htmlFor={`export-item-${item.id}`} className="flex-1 text-sm cursor-pointer truncate">
                          {item.title}{" "}
                          {item.type === "series" ? "(Serie)" : item.type === "movie" ? "(Película)" : "(Anime)"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={selectedItems.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                  Exportar {selectedItems.length} elementos seleccionados
                </Button>
              </>
            )}

            {allMedia.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay elementos disponibles para exportar.</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">Importar datos</h3>
            <Button onClick={handleImportClick} variant="outline" className="w-full justify-start gap-2">
              <FileUp className="h-4 w-4" />
              Importar datos
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
            <p className="text-xs text-muted-foreground">
              Nota: Al importar datos, se añadirán a tu colección actual. No se reemplazarán elementos existentes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportExportData
