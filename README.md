# CRM Desktop App

A simple, local-first Customer Relationship Management (CRM) desktop application built with Tauri v2, React, TypeScript, HeroUI, and Tailwind CSS.

## Features

- **Local-First Architecture**: All data is stored locally using SQLite
- **Contact Management**: Create, read, update, and delete contacts
- **Company Management**: Manage companies and link them to contacts
- **Notes & Interactions**: Track notes for both contacts and companies
- **Search & Filter**: Quickly find contacts and companies
- **Modern UI**: Clean and responsive interface using HeroUI components
- **Cross-Platform**: Runs on Windows, macOS, and Linux

## Tech Stack

- **[Tauri v2](https://v2.tauri.app/)**: Desktop application framework
- **[React 19](https://react.dev/)**: UI framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[HeroUI](https://www.heroui.com/)**: UI component library
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **SQLite**: Local database via Tauri SQL plugin

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific dependencies for Tauri (see [Tauri Prerequisites](https://tauri.app/start/prerequisites/))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Raosandeep007/crm.git
cd crm/crm-app
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode:

```bash
npm run tauri dev
```

This will start the Vite dev server and launch the Tauri application window.

## Building

Build the application for production:

```bash
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Project Structure

```
crm-app/
├── src/
│   ├── components/
│   │   ├── ContactsView.tsx    # Contact management interface
│   │   └── CompaniesView.tsx   # Company management interface
│   ├── database.ts             # Database utilities and operations
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Global styles
│   └── main.tsx               # Application entry point
├── src-tauri/
│   ├── src/
│   │   └── lib.rs             # Tauri backend
│   └── Cargo.toml             # Rust dependencies
└── package.json               # Node dependencies
```

## Database Schema

The application uses three main tables:

### Contacts
- `id`: Primary key
- `first_name`: Contact's first name
- `last_name`: Contact's last name
- `email`: Contact's email address
- `phone`: Contact's phone number
- `company_id`: Foreign key to companies table
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Companies
- `id`: Primary key
- `name`: Company name
- `industry`: Company industry
- `website`: Company website
- `phone`: Company phone number
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Notes
- `id`: Primary key
- `contact_id`: Foreign key to contacts table
- `company_id`: Foreign key to companies table
- `content`: Note content
- `created_at`: Timestamp

## Usage

1. **Managing Contacts**:
   - Click "Add Contact" to create a new contact
   - Use the search bar to filter contacts
   - Click "Edit" to update contact details
   - Click "Notes" to view and add notes for a contact
   - Click "Delete" to remove a contact

2. **Managing Companies**:
   - Switch to the "Companies" tab
   - Click "Add Company" to create a new company
   - Use the search bar to filter companies
   - Click "Edit" to update company details
   - Click "Notes" to view and add notes for a company
   - Click "Delete" to remove a company

3. **Linking Contacts to Companies**:
   - When creating or editing a contact, select a company from the dropdown

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

