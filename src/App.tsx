import { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { AuthForm } from './components/AuthForm';
import { Sidebar } from './components/Sidebar';
import { NotesList } from './components/NotesList';
import { MarkdownEditor } from './components/MarkdownEditor';
import { Note } from './lib/api';
import { PenTool } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useNotes();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(note => note.category_id === selectedCategory);
    }

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(note => note.is_favorite);
    }

    return filtered;
  }, [notes, searchTerm, selectedCategory, showFavorites]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleNewNote = async () => {
    const newNote = await createNote({
      title: 'New Note',
      content: '# Welcome to your new note\n\nStart writing here...',
    });
    if (newNote) {
      setSelectedNote(newNote);
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteSave = async (noteId: string, updates: Partial<Note>) => {
    await updateNote(noteId, updates);
  };

  const handleNoteDelete = async (noteId: string) => {
    await deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean) => {
    await updateNote(noteId, { is_favorite: isFavorite });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowFavorites(false);
    setSelectedNote(null);
  };

  const handleToggleFavorites = () => {
    setShowFavorites(!showFavorites);
    setSelectedCategory(null);
    setSelectedNote(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onNewNote={handleNewNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
      />

      <div className="flex-1 flex">
        <div className="w-80 bg-white border-r border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {showFavorites ? 'Favorite Notes' : 
                 selectedCategory ? 'Category Notes' : 
                 searchTerm ? 'Search Results' : 
                 'All Notes'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {notesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <NotesList
                  notes={filteredNotes}
                  selectedNote={selectedNote}
                  onNoteSelect={handleNoteSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {selectedNote ? (
            <MarkdownEditor
              note={selectedNote}
              onSave={handleNoteSave}
              onDelete={handleNoteDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <PenTool className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a note to start editing
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Choose a note from the sidebar or create a new one to begin writing.
                </p>
                <button
                  onClick={handleNewNote}
                  className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create New Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;