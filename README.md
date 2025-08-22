# Database Project - React Version

This is a React-based database listing application that displays databases from a Google Sheets data source with filtering capabilities.

## Features

- **Filtering System**: Filter by primary tags, secondary tags, tertiary tags, and providers
- **Alphabetical Filtering**: Filter databases by their first letter
- **Interactive Tags**: Click on tags to apply filters
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Instant filtering as you change selections

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── FilterBar.js          # Filter dropdowns component
│   ├── AlphabetFilter.js     # Letter-based filtering
│   ├── DatabaseList.js       # Main database list container
│   ├── DatabaseItem.js       # Individual database item
│   └── DatabaseCount.js      # Database count display
├── App.js                    # Main application component
├── App.css                   # Application styles
├── index.js                  # React entry point
└── index.css                 # Global styles
```

## Components Overview

- **App.js**: Main component that manages state and data fetching
- **FilterBar**: Handles all filter dropdowns with cascading logic
- **AlphabetFilter**: Letter-based filtering buttons
- **DatabaseList**: Organizes databases by letter sections
- **DatabaseItem**: Individual database display with clickable tags
- **DatabaseCount**: Shows the number of filtered results

## Data Source

The application fetches data from a Google Sheets document and processes it into a structured format. Each database entry includes:
- Name
- Provider
- Image URL
- Database URL
- Description
- Primary tag
- Additional tags

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects from Create React App (not recommended)

## Development Benefits

This React version provides several advantages over the original vanilla JavaScript implementation:

1. **Component-Based Architecture**: Easier to maintain and extend
2. **State Management**: Centralized state management with React hooks
3. **Reusable Components**: Components can be easily reused and modified
4. **Better Development Experience**: Hot reloading, better debugging tools
5. **Modern JavaScript**: Uses latest ES6+ features and React patterns
6. **Type Safety**: Easy to add TypeScript for better development experience

## Customization

You can easily customize the application by:
- Modifying the CSS in `App.css`
- Adding new filter types in `FilterBar.js`
- Changing the data processing logic in `App.js`
- Adding new components for additional features
