const express = require('express');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all notes for user
router.get('/', async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(`
        *,
        category:categories(*),
        tags:note_tags(tag:tags(*))
      `)
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch notes error:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }

    // Transform tags structure
    const notesWithTags = notes.map(note => ({
      ...note,
      tags: note.tags?.map(nt => nt.tag) || []
    }));

    res.json(notesWithTags);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const { data: note, error } = await supabase
      .from('notes')
      .select(`
        *,
        category:categories(*),
        tags:note_tags(tag:tags(*))
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Transform tags structure
    note.tags = note.tags?.map(nt => nt.tag) || [];

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content, category_id, is_favorite } = req.body;

    const { data: note, error } = await supabase
      .from('notes')
      .insert([{
        title: title || 'Untitled Note',
        content: content || '',
        category_id: category_id || null,
        is_favorite: is_favorite || false,
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Create note error:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category_id, is_favorite } = req.body;

    const { data: note, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        category_id,
        is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !note) {
      return res.status(404).json({ error: 'Note not found or update failed' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Delete note error:', error);
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { is_favorite } = req.body;

    const { data: note, error } = await supabase
      .from('notes')
      .update({ 
        is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;