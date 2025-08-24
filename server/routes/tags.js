const express = require('express');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tags for user
router.get('/', async (req, res) => {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', req.user.id)
      .order('name');

    if (error) {
      console.error('Fetch tags error:', error);
      return res.status(500).json({ error: 'Failed to fetch tags' });
    }

    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create tag
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const { data: tag, error } = await supabase
      .from('tags')
      .upsert([{
        name: name.toLowerCase().trim(),
        color: color || '#10B981',
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Create tag error:', error);
      return res.status(500).json({ error: 'Failed to create tag' });
    }

    res.status(201).json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add tag to note
router.post('/:tagId/notes/:noteId', async (req, res) => {
  try {
    const { tagId, noteId } = req.params;

    // Verify note belongs to user
    const { data: note } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .eq('user_id', req.user.id)
      .single();

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { error } = await supabase
      .from('note_tags')
      .insert([{ note_id: noteId, tag_id: tagId }]);

    if (error) {
      console.error('Add tag to note error:', error);
      return res.status(500).json({ error: 'Failed to add tag to note' });
    }

    res.json({ message: 'Tag added to note successfully' });
  } catch (error) {
    console.error('Add tag to note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove tag from note
router.delete('/:tagId/notes/:noteId', async (req, res) => {
  try {
    const { tagId, noteId } = req.params;

    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag_id', tagId);

    if (error) {
      console.error('Remove tag from note error:', error);
      return res.status(500).json({ error: 'Failed to remove tag from note' });
    }

    res.json({ message: 'Tag removed from note successfully' });
  } catch (error) {
    console.error('Remove tag from note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;