import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import LogicFlowchart from '../LogicFlowchart';
import { validateJsonLogic } from '../../utils/jsonLogicParser';

const STORAGE_KEY = 'generate_state';

const Generate: React.FC = () => {
  const [jsonLogic, setJsonLogic] = useState('');
  const [parsedLogic, setParsedLogic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state) {
          setJsonLogic(state.jsonLogic || '');
          setParsedLogic(state.parsedLogic || null);
          setError(state.error || null);
        }
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      jsonLogic,
      parsedLogic,
      error,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [jsonLogic, parsedLogic, error]);

  const handleConvert = () => {
    try {
      const parsed = JSON.parse(jsonLogic);
      validateJsonLogic(parsed);
      setParsedLogic(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON Logic');
      setParsedLogic(null);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        JSON Logic Generator
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={jsonLogic}
          onChange={(e) => setJsonLogic(e.target.value)}
          placeholder="Enter JSON Logic..."
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={handleConvert}
          disabled={!jsonLogic.trim()}
        >
          Visualize Logic
        </Button>
      </Paper>

      {parsedLogic && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Logic Flowchart
          </Typography>
          <LogicFlowchart logic={parsedLogic} />
        </Paper>
      )}
    </Box>
  );
};

export default Generate; 