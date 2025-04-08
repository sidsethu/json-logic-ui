import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Editor from '@monaco-editor/react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';
import { generateJsonLogic } from '../../utils/jsonLogicParser';

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [jsonLogic, setJsonLogic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await generateJsonLogic(prompt);
      setJsonLogic(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate JSON Logic');
      setJsonLogic('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLogic);
  };

  const handleClear = () => {
    setPrompt('');
    setJsonLogic('');
    setError('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        sx={{
          p: 3,
          background: alpha('#1e1e1e', 0.9),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Natural Language Input
          </Typography>
          <Tooltip title="Clear input">
            <IconButton onClick={handleClear} disabled={!prompt && !jsonLogic}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter your conditions in natural language (e.g., 'if age is greater than 18 and country is USA')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#000000', 0.2),
              '&:hover': {
                backgroundColor: alpha('#000000', 0.3),
              },
              '&.Mui-focused': {
                backgroundColor: alpha('#000000', 0.3),
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleGenerate}
          sx={{
            mt: 2,
            background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1557b0 30%, #1a73e8 90%)',
            },
          }}
          disabled={!prompt.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Generating...' : 'Generate JSON Logic'}
        </Button>
      </Paper>

      {jsonLogic && (
        <Paper
          sx={{
            p: 3,
            background: alpha('#1e1e1e', 0.9),
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Generated JSON Logic
            </Typography>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Editor
            height="300px"
            defaultLanguage="json"
            value={jsonLogic}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              formatOnPaste: true,
              formatOnType: true,
              wordWrap: 'on',
              automaticLayout: true,
              lineNumbers: 'on',
              renderWhitespace: 'all',
              tabSize: 2,
              insertSpaces: true,
              theme: 'vs-dark',
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default Generator; 