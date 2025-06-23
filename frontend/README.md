# Frontend - Next.js with TypeScript

This is the frontend application for Patrick's Web, built with Next.js 14+, TypeScript, and modular CSS architecture.

## 🏗️ Architecture

```
frontend/
├── src/
│   └── app/                 # App Router (Next.js 13+)
│       ├── about/           # About page
│       │   ├── page.tsx     # About component
│       │   └── page.module.css # About styles
│       ├── contact/         # Contact page
│       │   ├── page.tsx     # Contact component
│       │   └── page.module.css # Contact styles
│       ├── globals.css      # Global styles (minimal)
│       ├── layout.tsx       # Root layout
│       ├── page.tsx         # Home page component
│       └── page.module.css  # Home page styles
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Modular CSS Architecture

This project implements a **modular CSS approach** where each page has its own CSS module file, providing:

### Benefits
- ✅ **Scoped Styles**: CSS classes are automatically scoped to components
- ✅ **No Conflicts**: Eliminates CSS class name collisions
- ✅ **Better Maintainability**: Styles are co-located with components
- ✅ **Performance**: Only loads CSS for current page
- ✅ **Type Safety**: CSS modules provide IntelliSense in TypeScript

### Structure Pattern
Each page follows this pattern:
```
page-name/
├── page.tsx           # TypeScript component
└── page.module.css    # CSS module styles
```

### Usage Example
```typescript
// page.tsx
import styles from './page.module.css';

export default function MyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Page</h1>
    </div>
  );
}
```

```css
/* page.module.css */
.container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  color: #333;
}
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start on http://localhost:3000

### 3. Build for Production
```bash
npm run build
npm start
```

## 🛣️ Routing

This project uses **Next.js App Router** (Next.js 13+) with file-based routing:

- `/` - Home page (`app/page.tsx`)
- `/about` - About page (`app/about/page.tsx`)
- `/contact` - Contact page (`app/contact/page.tsx`)

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add `page.tsx` for the component
3. Add `page.module.css` for styles

## 🎨 Styling Guidelines

### CSS Modules Naming Convention
- Use **camelCase** for class names in CSS modules
- Use descriptive names that reflect the component's purpose

```css
/* ✅ Good */
.container { }
.primaryButton { }
.navigationMenu { }

/* ❌ Avoid */
.btn { }
.red { }
.big { }
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🚀 Deployment

### Vercel (Recommended)
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
