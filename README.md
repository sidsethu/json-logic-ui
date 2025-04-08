# JSON Logic UI

A user-friendly web interface for working with JSON Logic. This application helps non-technical users create and understand JSON Logic expressions through a simple interface.

## Features

- **Generator Tab**: Convert natural language conditions into JSON Logic format
- **Resolver Tab**: Convert JSON Logic into readable English
- **Validation**: Built-in validation for JSON Logic expressions
- **Test Data**: Ability to test JSON Logic with sample data
- **Support for all JSON Logic operators**:
  - Comparison operators (==, !=, >, >=, <, <=, in, nin)
  - Logical operators (and, or, not)
  - Data access (var, missing, missing_some)
  - Array operations (all, some, none, merge, in)
  - String operations (cat, substr, log)
  - Numeric operations (+, -, *, /, %, min, max)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- Built with React and TypeScript
- Uses Material-UI for components
- Monaco Editor for JSON editing
- JSON Logic JS for parsing and validation

## Project Structure

```
src/
├── components/
│   ├── Generator/      # Natural language to JSON Logic conversion
│   ├── Resolver/       # JSON Logic to English conversion
│   └── TabPanel.tsx    # Main tab navigation
├── utils/
│   ├── jsonLogicParser.ts
│   └── englishConverter.ts
└── App.tsx
``` 