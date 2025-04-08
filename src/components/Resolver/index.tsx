import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Editor from '@monaco-editor/react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import { validateJsonLogic } from '../../utils/jsonLogicParser';
import LogicFlowchart from '../LogicFlowchart';

const STORAGE_KEY = 'resolver_state';

const Resolver: React.FC = () => {
  const [jsonLogic, setJsonLogic] = useState('');
  const [parsedLogic, setParsedLogic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state) {
          setJsonLogic(state.jsonLogic || '');
          setParsedLogic(state.parsedLogic || null);
          setTestData(state.testData || '');
          setTestResult(state.testResult || null);
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
      testData,
      testResult,
      error,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [jsonLogic, parsedLogic, testData, testResult, error]);

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

  const handleTest = () => {
    try {
      const parsedLogic = JSON.parse(jsonLogic);
      const parsedData = JSON.parse(testData);
      const result = validateJsonLogic(parsedLogic, parsedData);
      setTestResult(JSON.stringify(result, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test JSON Logic');
      setTestResult(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setJsonLogic('');
    setParsedLogic(null);
    setTestData('');
    setTestResult(null);
    setError(null);
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
            JSON Logic Input
          </Typography>
          <Box>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={() => handleCopy(jsonLogic)} disabled={!jsonLogic}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear input">
              <IconButton onClick={handleClear} disabled={!jsonLogic && !testData}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Editor
          height="300px"
          defaultLanguage="json"
          value={jsonLogic}
          onChange={(value) => setJsonLogic(value || '')}
          options={{
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
        <Button
          variant="contained"
          onClick={handleConvert}
          sx={{
            mt: 2,
            background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1557b0 30%, #1a73e8 90%)',
            },
          }}
          disabled={!jsonLogic.trim()}
        >
          Visualize Logic
        </Button>
      </Paper>

      {parsedLogic && (
        <Paper
          sx={{
            p: 3,
            background: alpha('#1e1e1e', 0.9),
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Logic Flowchart
          </Typography>
          <LogicFlowchart logic={parsedLogic} />
        </Paper>
      )}

      <Paper
        sx={{
          p: 3,
          background: alpha('#1e1e1e', 0.9),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Test Data
        </Typography>
        <Editor
          height="200px"
          defaultLanguage="json"
          value={testData}
          onChange={(value) => setTestData(value || '')}
          options={{
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
        <Button
          variant="contained"
          onClick={handleTest}
          sx={{
            mt: 2,
            background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1557b0 30%, #1a73e8 90%)',
            },
          }}
          disabled={!jsonLogic.trim() || !testData.trim()}
        >
          Test Logic
        </Button>
        {testResult && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Test Result:</Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton onClick={() => handleCopy(testResult)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Paper
              sx={{
                p: 2,
                bgcolor: alpha('#000000', 0.2),
                borderRadius: 1,
                fontFamily: 'monospace',
              }}
            >
              {testResult}
            </Paper>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Resolver; 