<<<<<<< HEAD
# app-piv
=======
# Pivora Dashboard App


## Features
- **Login Authentication**: Simple login (admin/admin) with localStorage session.
- **Dashboard**: View logs in a table with columns for DOC ID, Date, File Name, File Path, and Status.
- **Date Range Picker**: Select a single date or a range to filter logs.
- **Status Filter**: Filter logs by status (NEW, Processed) with a modern dropdown.
- **Sorting**: Clickable headers for DOC ID and Date to sort ascending/descending.
- **Pagination**: Modern, compact pagination for navigating log pages.
- **CSV Export**: Download the filtered table as a CSV file.
- **Responsive UI**: Clean, modern design with custom blue theme (#005D9B).

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Installation
 ```
1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173] or (http://localhost:5173) in your browser.

### Usage
- **Login**: Use `admin` for both username and password.
- **Dashboard**: Filter, sort, and export logs as needed.

## Project Structure
- `src/components/` — React components (Dashboard, Login, etc.)
- `src/styles/` — CSS files for styling
- `src/assets/` — Images and logos
- `src/App.jsx` — Main app logic and routing

## Dependencies
- react
- react-dom
- react-router-dom
- react-datepicker

## License
MIT
>>>>>>> 143608d (added new files)
