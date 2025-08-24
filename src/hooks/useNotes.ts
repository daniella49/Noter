import { useState, useEffect } from 'react';
import { apiClient, Note, Category, Tag } from '../lib/api';
import { useAuth } from './useAuth';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchCategories();
      fetchTags();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;

    try {
      const data = await apiClient.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    if (!user) return;

    try {
      const data = await apiClient.getTags();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createNote = async (noteData: Partial<Note>) => {
    if (!user) return null;

    try {
      const data = await apiClient.createNote(noteData);
      fetchNotes();
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const data = await apiClient.updateNote(id, updates);
      fetchNotes();
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await apiClient.deleteNote(id);
      fetchNotes();
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  const createCategory = async (name: string, color: string) => {
    if (!user) return null;

    try {
      const data = await apiClient.createCategory(name, color);
      fetchCategories();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiClient.deleteCategory(id);
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };

  const createTag = async (name: string) => {
    try {
      const data = await apiClient.createTag(name);
      fetchTags();
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  };

  const addTagToNote = async (noteId: string, tagId: string) => {
    try {
      await apiClient.addTagToNote(tagId, noteId);
      fetchNotes();
      return true;
    } catch (error) {
      console.error('Error adding tag to note:', error);
      return false;
    }
  };

  return {
    notes,
    categories,
    tags,
    loading,
    createNote,
    updateNote,
    deleteNote,
    createCategory,
    deleteCategory,
    createTag,
    addTagToNote,
    refreshNotes: fetchNotes,
  };
}
