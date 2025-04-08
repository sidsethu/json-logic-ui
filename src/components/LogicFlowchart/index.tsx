import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

interface LogicFlowchartProps {
  logic: any;
}

const LogicFlowchart: React.FC<LogicFlowchartProps> = ({ logic }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [sectionIds, setSectionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Collect all section IDs when logic changes
    const ids = new Set<string>();
    const collectIds = (obj: any, level: number, parentId: string) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Handle if-then-else arrays
      if (Array.isArray(obj) && obj.length === 3 && typeof obj[0] === 'object') {
        const currentId = `${parentId}-if`;
        ids.add(currentId);
        collectIds(obj[0], level + 1, `${currentId}-condition`);
        collectIds(obj[1], level + 1, `${currentId}-then`);
        collectIds(obj[2], level + 1, `${currentId}-else`);
        return;
      }

      // Handle objects with operators
      if (Object.keys(obj).length === 1) {
        const operator = Object.keys(obj)[0];
        const value = obj[operator];
        const currentId = `${parentId}-${operator}`;
        ids.add(currentId);

        if (operator === 'if') {
          collectIds(value[0], level + 1, `${currentId}-condition`);
          collectIds(value[1], level + 1, `${currentId}-then`);
          if (value[2]) {
            collectIds(value[2], level + 1, `${currentId}-else`);
          }
        } else if (operator === 'and' || operator === 'or') {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              collectIds(item, level + 1, `${currentId}-${index}`);
            });
          }
        } else if (operator === 'not') {
          collectIds(value, level + 1, `${currentId}-content`);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              collectIds(item, level + 1, `${currentId}-${index}`);
            }
          });
        } else if (typeof value === 'object') {
          collectIds(value, level + 1, currentId);
        }
      }
    };
    
    collectIds(logic, 0, 'root');
    console.log('Collected section IDs:', Array.from(ids)); // Debug log
    setSectionIds(ids);
  }, [logic]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(sectionIds);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const renderLogic = (logicObj: any, level: number, sectionId: string): React.ReactNode => {
    if (!logicObj || typeof logicObj !== 'object') {
      return (
        <Typography color="text.secondary" sx={{ bgcolor: 'rgba(189, 189, 189, 0.2)', p: 1, borderRadius: 1 }}>
          {JSON.stringify(logicObj)}
        </Typography>
      );
    }

    const operator = Object.keys(logicObj)[0];
    const value = logicObj[operator];
    const currentSectionId = `${sectionId}-${operator}`;

    // Handle if-then-else arrays
    if (Array.isArray(logicObj) && logicObj.length === 3 && typeof logicObj[0] === 'object') {
      const currentSectionId = `${sectionId}-if`;
      return (
        <Accordion 
          expanded={expandedSections.has(currentSectionId)}
          onChange={() => toggleSection(currentSectionId)}
          sx={{ 
            bgcolor: 'transparent',
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              minHeight: 'auto !important',
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(144, 202, 249, 0.3)',
              p: 1,
              borderRadius: 1,
              width: '100%',
            }}>
              <Typography color="primary.main" sx={{ fontWeight: 'bold' }}>
                IF-THEN-ELSE
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ ml: level * 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 1,
                bgcolor: 'rgba(144, 202, 249, 0.3)',
                p: 1,
                borderRadius: 1,
              }}>
                <Typography color="primary.main" sx={{ fontWeight: 'bold' }}>
                  IF
                </Typography>
              </Box>
              <Box sx={{ ml: 2, bgcolor: 'rgba(144, 202, 249, 0.2)', p: 2, borderRadius: 1, mb: 1 }}>
                {renderLogic(logicObj[0], level + 1, `${currentSectionId}-condition`)}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                my: 1,
                bgcolor: 'rgba(129, 199, 132, 0.3)',
                p: 1,
                borderRadius: 1,
              }}>
                <Typography color="success.main" sx={{ fontWeight: 'bold' }}>
                  THEN
                </Typography>
              </Box>
              <Box sx={{ ml: 2, bgcolor: 'rgba(129, 199, 132, 0.2)', p: 2, borderRadius: 1, mb: 1 }}>
                {renderLogic(logicObj[1], level + 1, `${currentSectionId}-then`)}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                my: 1,
                bgcolor: 'rgba(239, 154, 154, 0.3)',
                p: 1,
                borderRadius: 1,
              }}>
                <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                  ELSE
                </Typography>
              </Box>
              <Box sx={{ ml: 2, bgcolor: 'rgba(239, 154, 154, 0.2)', p: 2, borderRadius: 1 }}>
                {renderLogic(logicObj[2], level + 1, `${currentSectionId}-else`)}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    }

    const renderContent = () => {
      if (operator === 'if') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 1,
              bgcolor: 'rgba(144, 202, 249, 0.3)',
              p: 1,
              borderRadius: 1,
            }}>
              <Typography color="primary.main" sx={{ fontWeight: 'bold' }}>
                IF
              </Typography>
            </Box>
            <Box sx={{ ml: 2, bgcolor: 'rgba(144, 202, 249, 0.2)', p: 2, borderRadius: 1, mb: 1 }}>
              {renderLogic(value[0], level + 1, `${currentSectionId}-condition`)}
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              my: 1,
              bgcolor: 'rgba(129, 199, 132, 0.3)',
              p: 1,
              borderRadius: 1,
            }}>
              <Typography color="success.main" sx={{ fontWeight: 'bold' }}>
                THEN
              </Typography>
            </Box>
            <Box sx={{ ml: 2, bgcolor: 'rgba(129, 199, 132, 0.2)', p: 2, borderRadius: 1, mb: 1 }}>
              {renderLogic(value[1], level + 1, `${currentSectionId}-then`)}
            </Box>
            {value[2] && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  my: 1,
                  bgcolor: 'rgba(239, 154, 154, 0.3)',
                  p: 1,
                  borderRadius: 1,
                }}>
                  <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                    ELSE
                  </Typography>
                </Box>
                <Box sx={{ ml: 2, bgcolor: 'rgba(239, 154, 154, 0.2)', p: 2, borderRadius: 1 }}>
                  {renderLogic(value[2], level + 1, `${currentSectionId}-else`)}
                </Box>
              </>
            )}
          </Box>
        );
      }

      if (operator === 'and' || operator === 'or') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 1,
              bgcolor: 'rgba(186, 104, 200, 0.3)',
              p: 1,
              borderRadius: 1,
            }}>
              <Typography color="secondary.main" sx={{ fontWeight: 'bold' }}>
                {operator.toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ ml: 2, bgcolor: 'rgba(186, 104, 200, 0.2)', p: 2, borderRadius: 1 }}>
              {Array.isArray(value) &&
                value.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    {renderLogic(item, level + 1, `${currentSectionId}-${index}`)}
                  </Box>
                ))}
            </Box>
          </Box>
        );
      }

      if (operator === 'not') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 1,
              bgcolor: 'rgba(239, 154, 154, 0.3)',
              p: 1,
              borderRadius: 1,
            }}>
              <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                NOT
              </Typography>
            </Box>
            <Box sx={{ ml: 2, bgcolor: 'rgba(239, 154, 154, 0.2)', p: 2, borderRadius: 1 }}>
              {renderLogic(value, level + 1, `${currentSectionId}-content`)}
            </Box>
          </Box>
        );
      }

      if (operator === 'in') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(100, 181, 246, 0.3)',
              p: 2,
              borderRadius: 1,
            }}>
              {renderLogic(value[0], level + 1, `${currentSectionId}-value`)}
              <Typography color="info.main" sx={{ fontWeight: 'bold' }}>
                IN
              </Typography>
              {renderLogic(value[1], level + 1, `${currentSectionId}-array`)}
            </Box>
          </Box>
        );
      }

      if (operator === '<' || operator === '>' || operator === '<=' || operator === '>=' || operator === '==' || operator === '!=') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 167, 38, 0.3)',
              p: 2,
              borderRadius: 1,
            }}>
              {renderLogic(value[0], level + 1, `${currentSectionId}-left`)}
              <Typography color="warning.main" sx={{ fontWeight: 'bold' }}>
                {operator === '<' ? 'LESS THAN' : 
                 operator === '>' ? 'GREATER THAN' :
                 operator === '<=' ? 'LESS THAN OR EQUAL TO' :
                 operator === '>=' ? 'GREATER THAN OR EQUAL TO' :
                 operator === '==' ? 'EQUALS' : 'NOT EQUALS'}
              </Typography>
              {renderLogic(value[1], level + 1, `${currentSectionId}-right`)}
            </Box>
          </Box>
        );
      }

      if (operator === '+' || operator === '-' || operator === '*' || operator === '/' || operator === '%' || operator === 'max' || operator === 'min') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(100, 181, 246, 0.3)',
              p: 2,
              borderRadius: 1,
            }}>
              <Typography color="info.main" sx={{ fontWeight: 'bold' }}>
                {operator.toUpperCase()}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.isArray(value) && value.map((item, index) => (
                  <Box key={index}>
                    {renderLogic(item, level + 1, `${currentSectionId}-${index}`)}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        );
      }

      if (operator === 'var') {
        return (
          <Box sx={{ ml: level * 2 }}>
            <Typography color="text.secondary" sx={{ bgcolor: 'rgba(189, 189, 189, 0.2)', p: 1, borderRadius: 1 }}>
              Variable: {value}
            </Typography>
          </Box>
        );
      }

      return (
        <Box sx={{ ml: level * 2 }}>
          <Typography color="text.secondary" sx={{ bgcolor: 'rgba(189, 189, 189, 0.2)', p: 1, borderRadius: 1 }}>
            {operator}: {JSON.stringify(value)}
          </Typography>
        </Box>
      );
    };

    // Wrap all operators in Accordions
    return (
      <Accordion 
        expanded={expandedSections.has(currentSectionId)}
        onChange={() => toggleSection(currentSectionId)}
        sx={{ 
          bgcolor: 'transparent',
          '&:before': { display: 'none' },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            minHeight: 'auto !important',
            '& .MuiAccordionSummary-content': { margin: '8px 0' }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(189, 189, 189, 0.2)',
            p: 1,
            borderRadius: 1,
            width: '100%',
          }}>
            <Typography sx={{ fontWeight: 'bold' }}>
              {operator.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Array.isArray(value) ? `${value.length} items` : '1 item'}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {renderContent()}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ 
      position: 'relative',
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'top left',
      transition: 'transform 0.2s ease-in-out',
      width: '100%',
      overflow: 'auto',
      maxHeight: '600px',
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
      minWidth: '800px',
    }}>
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        right: 0, 
        display: 'flex', 
        gap: 1, 
        justifyContent: 'flex-end',
        mb: 2,
        zIndex: 1,
      }}>
        <Tooltip title="Expand All">
          <IconButton 
            onClick={expandAll}
            size="small"
          >
            <UnfoldMoreIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Collapse All">
          <IconButton 
            onClick={collapseAll}
            size="small"
          >
            <UnfoldLessIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom In">
          <IconButton 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))}
            disabled={zoomLevel >= 3}
            size="small"
          >
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
            disabled={zoomLevel <= 0.5}
            size="small"
          >
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open in Full Screen">
          <IconButton 
            onClick={() => setOpenDialog(true)}
            size="small"
          >
            <OpenInFullIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        position: 'relative',
        width: '100%',
        minWidth: '800px',
      }}>
        {renderLogic(logic, 0, 'root')}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}>
          Logic Flowchart
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ 
            height: '100%',
            overflow: 'auto',
            p: 2,
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
            }}>
              {renderLogic(logic, 0, 'dialog-root')}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogicFlowchart; 