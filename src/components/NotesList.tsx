import { formatDistanceToNow } from 'date-fns';
import { Star, Calendar, Tag } from 'lucide-react';
import { Note } from '../lib/api';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
}

export function NotesList({ notes, selectedNote, onNoteSelect, onToggleFavorite }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Calendar className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No notes found</h3>
        <p className="text-sm text-center">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onNoteSelect(note)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
            selectedNote?.id === note.id
              ? 'border-indigo-200 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
              {note.title || 'Untitled'}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id, !note.is_favorite);
              }}
              className={`transition-colors ${
                note.is_favorite 
                  ? 'text-amber-500 hover:text-amber-600' 
                  : 'text-gray-300 hover:text-amber-500'
              }`}
            >
              <Star className="w-4 h-4" fill={note.is_favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {note.content || 'No content'}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              {note.category && (
                <div className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: note.category.color }}
                  />
                  <span>{note.category.name}</span>
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <span>
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}