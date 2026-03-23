# Dqmainer

<p align="center">
  <img src="https://github.com/isixe/dqmainer/blob/main/public/favicon.png?raw=true" alt="Dqmainer Logo" width="100" height="100">
</p>

<h4 align="center">Dqmainer - Domain Query Tool</h4>

<p align="center">
  Dqmainer is a domain WHOIS lookup tool that provides fast and accurate domain information query services, supporting batch queries and multi-language interface.
</p>

## Features

- **Real-time WHOIS Lookup**: Quickly get detailed domain registration information, expiration dates, and other data
- **Batch Query**: Support querying multiple domains simultaneously to improve work efficiency
- **Intuitive Data Display**: Provides both card and list view modes
- **Smart Sorting**: Support sorting by domain name, expiration date, etc.
- **Expiration Status Alerts**: Display different statuses based on domain expiration time (safe, warning, critical)
- **API Interface**: Provides RESTful API for other applications to call

## Tech Stack

- **Frontend Framework**: Next.js 16
- **UI Components**: shadcn/ui + Tailwind CSS 4
- **Internationalization**: i18next
- **Domain Lookup**: @cleandns/whois-rdap

## Usage

### Basic Query

1. Enter one or more domains in the text box on the homepage (one per line or separated by commas)
2. Click the "Query" button
3. View the query results, including registrar, creation date, update date, expiration date, etc.

### Batch Query

- Multiple domains can be entered at the same time, and the system will automatically process and display all results
- Support switching between card view and list view
- Can sort by domain name or expiration date


## Quick Start

1. Clone the Repository

```bash
git clone https://github.com/isixe/dqmainer.git
cd dqmainer
```

2. Install Dependencies

```bash
pnpm install
```

3. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000` in your browser.


## Project Structure

```
dqmainer/
├── public/              # Static resources
│   ├── favicon.ico
│   └── og-image.png
├── src/                 # Source code
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── api-docs/    # API documentation page
│   │   ├── layout.tsx   # App layout
│   │   └── page.tsx     # Home page
│   ├── components/      # Components
│   │   └── ui/          # UI components
│   ├── layout/          # Layout components
│   ├── lib/             # Utility library
│   ├── locales/         # Internationalization files
│   ├── style/           # Style files
│   └── types/           # TypeScript type definitions
├── .gitignore           # Git ignore file
├── LICENSE              # License
├── README.md            # Project documentation
├── components.json      # shadcn/ui configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
├── pnpm-lock.yaml       # pnpm lock file
├── postcss.config.mjs   # PostCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Contributing

Welcome to submit Issues and Pull Requests to improve the project!

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details