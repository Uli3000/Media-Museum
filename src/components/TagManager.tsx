import React, { useState } from 'react';
import { useMedia } from '@/context/MediaContext';
import { Tag } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tags, Tag as TagIcon, Edit, Trash } from 'lucide-react';

interface TagManagerProps {
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ selectedTags, onTagToggle }) => {
  const { allTags, addTag } = useMedia();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Color azul por defecto
  
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const createdTag = addTag(newTagName.trim(), newTagColor);
      onTagToggle(createdTag);
      setNewTagName('');
    }
  };

  const isTagSelected = (tag: Tag) => {
    return selectedTags.some(t => t.id === tag.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <Badge 
            key={tag.id}
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              borderColor: tag.color
            }}
            variant="outline" 
            className="flex items-center gap-1 group"
          >
            <TagIcon className="h-3 w-3 mr-1" />
            {tag.name}
            <button 
              onClick={() => onTagToggle(tag)}
              className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="h-3 w-3 mr-1" />
              Añadir etiqueta
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Tags className="h-4 w-4 mr-2" />
              Etiquetas disponibles
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
              {allTags.map(tag => (
                <Badge 
                  key={tag.id}
                  style={{
                    backgroundColor: isTagSelected(tag) ? `${tag.color}20` : 'transparent',
                    color: tag.color,
                    borderColor: tag.color
                  }}
                  variant="outline" 
                  className={`cursor-pointer flex items-center gap-1 ${
                    isTagSelected(tag) ? 'opacity-100' : 'opacity-70'
                  } hover:opacity-100`}
                  onClick={() => onTagToggle(tag)}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag.name}
                  {isTagSelected(tag) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Crear nueva etiqueta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Crear nueva etiqueta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tag-name">Nombre</Label>
                    <Input 
                      id="tag-name" 
                      value={newTagName} 
                      onChange={(e) => setNewTagName(e.target.value)} 
                      placeholder="Nombre de la etiqueta"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tag-color">Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="tag-color"
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="h-10 w-10 rounded-md border"
                      />
                      <Input
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        placeholder="#hex"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="w-full"
                  >
                    Crear etiqueta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// Componente para administrar todas las etiquetas
export const TagsAdminDialog: React.FC = () => {
  const { allTags, deleteTag, updateTag } = useMedia();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (editingTag && editName.trim()) {
      updateTag({
        ...editingTag,
        name: editName.trim(),
        color: editColor
      });
      setEditingTag(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="h-4 w-4 mr-2" />
          Administrar etiquetas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Administrar etiquetas</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {allTags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay etiquetas creadas
            </div>
          ) : (
            <div className="space-y-2">
              {allTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md">
                  {editingTag?.id === tag.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-8 w-8 rounded-md border"
                      />
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingTag(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: tag.color }} 
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      <div>
                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(tag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTag(tag.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nueva etiqueta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Crear nueva etiqueta</DialogTitle>
              </DialogHeader>
              <TagCreationForm />
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente para crear una nueva etiqueta
const TagCreationForm: React.FC = () => {
  const { addTag } = useMedia();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  
  const handleCreate = () => {
    if (name.trim()) {
      addTag(name.trim(), color);
      setName('');
      setColor('#3b82f6');
    }
  };
  
  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="new-tag-name">Nombre</Label>
        <Input 
          id="new-tag-name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Nombre de la etiqueta"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-tag-color">Color</Label>
        <div className="flex gap-2">
          <input
            id="new-tag-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 rounded-md border"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#hex"
          />
        </div>
      </div>
      <Button 
        onClick={handleCreate}
        disabled={!name.trim()}
        className="w-full"
      >
        Crear etiqueta
      </Button>
    </div>
  );
};
