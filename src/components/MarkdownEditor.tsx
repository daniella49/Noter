import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, Edit3, Save, Trash2, Star, Tag, Folder } from 'lucide-react';
import { Note } from '../lib/api';
import { useNotes } from '../hooks/useNotes';

interface MarkdownEditorProps {
  note: Note;
  onSave: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
}

export function MarkdownEditor({ note, onSave, onDelete, onToggleFavorite }: MarkdownEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(note.category_id || '');
  
  const { categories } = useNotes();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSelectedCategoryId(note.category_id || '');
    setHasUnsavedChanges(false);
  }, [note]);

  useEffect(() => {
    const hasChanges =
      title !== note.title ||
      content !== note.content ||
      selectedCategoryId !== (note.category_id || '');
    setHasUnsavedChanges(hasChanges);
  }, [title, content, selectedCategoryId, note]);

  const handleSave = () => {
    const updates: Partial<Note> = {
      title: title || 'Untitled',
      content,
    };

    if (selectedCategoryId && selectedCategoryId !== note.category_id) {
      updates.category_id = selectedCategoryId;
    } else if (!selectedCategoryId && note.category_id) {
      updates.category_id = null as any;
    }

    onSave(note.id, updates);
    setHasUnsavedChanges(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  // Markdown code renderer
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            {...props}
            style={tomorrow as any}
            language={match[1]}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      } else {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    },
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1 mr-4"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(note.id, !note.is_favorite)}
              className={`p-2 rounded-lg transition-colors ${
                note.is_favorite 
                  ? 'text-amber-500 hover:bg-amber-50' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Star className="w-5 h-5" fill={note.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`p-2 rounded-lg transition-colors ${
                isPreview ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-1">
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {isPreview ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents as any} // cast as any to fix TS
              >
                {content || 'Start writing your note...'}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note in Markdown..."
            className="flex-1 p-6 resize-none border-none outline-none font-mono text-gray-800 leading-relaxed"
            style={{ fontSize: '14px' }}
          />
        )}
      </div>
    </div>
  );
}
