import React, { useState } from 'react';
import { Plus, Search, Star, Tag, Folder, Settings, LogOut, PenTool } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { Category } from '../lib/api';

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onNewNote: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export function Sidebar({ 
  selectedCategory, 
  onCategorySelect, 
  onNewNote,
  searchTerm,
  onSearchChange,
  showFavorites,
  onToggleFavorites
}: SidebarProps) {
  const { signOut } = useAuth();
  const { categories } = useNotes();
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');

  const { createCategory } = useNotes();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await createCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('#6366f1');
    setShowNewCategoryForm(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const categoryColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <PenTool className="w-4 h-4 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Noter</h1>
        </div>

        <button
          onClick={onNewNote}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
              selectedCategory === null && !showFavorites
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>All Notes</span>
          </button>

          <button
            onClick={onToggleFavorites}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
              showFavorites
                ? 'bg-amber-50 text-amber-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categories</h3>
            <button
              onClick={() => setShowNewCategoryForm(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => onCategorySelect(category.id)}
                  className="flex-1 flex items-center space-x-3 text-left"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm truncate">{category.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {showNewCategoryForm && (
              <form onSubmit={handleCreateCategory} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  {categoryColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newCategoryColor === color ? 'border-gray-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-1 px-3 rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#6366f1');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}