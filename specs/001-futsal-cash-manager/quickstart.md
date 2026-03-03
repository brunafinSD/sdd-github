# Quickstart Guide: Futsal Cash Manager Development

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Purpose**: Guia rápido para setup e implementação da feature
**Date**: 2026-03-03

## Initial Setup

### 1. Create Vite Project

```bash
# Create project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional deps
npm install zustand zod react-hook-form @hookform/resolvers dexie
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npm install -D @playwright/test
npm install -D eslint-plugin-jsx-a11y jest-axe
npm install -D workbox-cli workbox-precaching workbox-routing
```

### 2. Configure Tailwind

```bash
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E40AF',
          green: '#10B981',
          orange: '#F97316',
          'gray-dark': '#1F2937',
          'gray-light': '#F3F4F6'
        }
      }
    }
  },
  plugins: []
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### 4. Configure PWA (Workbox)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Futsal Cash Manager',
        short_name: 'FutsalCash',
        description: 'Gerenciamento de presença e caixa para time de futsal',
        theme_color: '#1E40AF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

---

## Implementation Order (Priority-Based)

### Phase 1: Foundation (Day 1-2)

**1.1 Types & Utils**
```bash
mkdir -p src/{types,utils,test}
```

Create in order:
1. `types/money.ts` - Money type + helpers
2. `types/game.ts` - Game, Player types
3. `types/cash.ts` - Transaction, CashSummary types
4. `utils/calculations.ts` - Financial calculations
5. `utils/formatters.ts` - Money, date formatters
6. `utils/whatsappParser.ts` - WhatsApp list parser

**Tests**: Write tests for each util as you create it (TDD)

```bash
npm run test -- calculations.test.ts
npm run test -- whatsappParser.test.ts
```

**1.2 Storage Layer**
```bash
mkdir -p src/services
```

Create:
1. `services/db.ts` - Dexie setup + schema
2. `services/storage.ts` - Storage abstraction
3. `services/mockData.ts` - Initial mock data

**1.3 Stores**
```bash
mkdir -p src/store
```

Create:
1. `store/gameStore.ts` - Game state + actions
2. `store/cashStore.ts` - Cash state + actions
3. `store/appStore.ts` - App-level state (theme, etc.)

**Tests**: Integration tests for stores
```bash
npm run test -- gameStore.test.ts
```

---

### Phase 2: UI Atoms (Day 3)

**2.1 Base Components**
```bash
mkdir -p src/components/ui
```

Create in order:
1. `components/ui/Button.tsx`
2. `components/ui/Input.tsx`
3. `components/ui/Card.tsx`
4. `components/ui/Badge.tsx`
5. `components/ui/Spinner.tsx`

**Tests**: Each component has RTL + a11y tests
```bash
npm run test -- Button.test.tsx
```

**Storybook** (optional):
```bash
npx sb init --builder vite
```

---

### Phase 3: Dashboard (P1 - Day 4-5)

**3.1 Dashboard Components**
```bash
mkdir -p src/components/dashboard
```

Create:
1. `components/dashboard/CashDisplay.tsx`
2. `components/dashboard/GameCard.tsx`
3. `components/dashboard/GameList.tsx`

**3.2 Dashboard Page**
```bash
mkdir -p src/pages
```

Create:
1. `pages/Dashboard.tsx`

**3.3 Layout**
```bash
mkdir -p src/components/layout
```

Create:
1. `components/layout/Header.tsx`
2. `components/layout/Navigation.tsx`
3. `components/layout/Container.tsx`

**Tests**: Integration tests for Dashboard
```bash
npm run test -- Dashboard.test.tsx
```

**Validation**: Run app, verify dashboard loads with mock data
```bash
npm run dev
```

---

### Phase 4: Game Management (P2 - Day 6-8)

**4.1 Game Components**
```bash
mkdir -p src/components/game
```

Create in order:
1. `components/game/PlayerRow.tsx`
2. `components/game/PlayerList.tsx`
3. `components/game/GameForm.tsx`
4. `hooks/useWhatsAppParser.ts` - Custom hook

**4.2 Game Pages**

Create:
1. `pages/GameCreate.tsx`
2. `pages/GameDetail.tsx`

**Tests**:
```bash
npm run test -- GameForm.test.tsx
npm run test -- useWhatsAppParser.test.ts
```

**Validation**: Create game flow works end-to-end
```bash
npm run dev
# Test: Dashboard → Create Game → Add players → Finalize → Caixa updates
```

---

### Phase 5: Cash Adjustments (P3 - Day 9)

**5.1 Cash Components**
```bash
mkdir -p src/components/cash
```

Create:
1. `components/cash/CashAdjustForm.tsx`
2. `pages/CashAdjust.tsx`

**Tests**:
```bash
npm run test -- CashAdjustForm.test.tsx
```

---

### Phase 6: History (P4 - Day 10)

**6.1 History Components**
```bash
mkdir -p src/components/history
```

Create:
1. `components/history/TransactionItem.tsx`
2. `components/history/TransactionList.tsx`
3. `components/history/GameHistoryList.tsx`
4. `pages/History.tsx`

**Tests**:
```bash
npm run test -- TransactionList.test.tsx
```

---

### Phase 7: Routing & Navigation (Day 11)

**7.1 Setup React Router**
```bash
npm install react-router-dom
```

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { GameCreate } from './pages/GameCreate';
import { GameDetail } from './pages/GameDetail';
import { CashAdjust } from './pages/CashAdjust';
import { History } from './pages/History';
import { Layout } from './components/layout/Layout';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/games/new" element={<GameCreate />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/cash/adjust" element={<CashAdjust />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

---

### Phase 8: E2E Tests (Day 12)

**8.1 Setup Playwright**
```bash
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**8.2 Write E2E Tests**
```bash
mkdir -p tests/e2e
```

Create:
1. `tests/e2e/dashboard.spec.ts` - P1 Dashboard
2. `tests/e2e/game-flow.spec.ts` - P2 Create/finalize game
3. `tests/e2e/cash-adjust.spec.ts` - P3 Manual adjustments
4. `tests/e2e/history.spec.ts` - P4 History views

Run:
```bash
npx playwright test
```

---

### Phase 9: PWA Polish (Day 13)

**9.1 Icons & Manifest**
- Generate PWA icons (192x192, 512x512) using tool like https://realfavicongenerator.net/
- Place in `public/` folder
- Update `manifest` in `vite.config.ts`

**9.2 Offline Behavior**
- Test app offline: DevTools → Network → Offline
- Verify: Assets load from cache, data persists in IndexedDB

**9.3 Install Prompt**
```typescript
// src/hooks/usePWAInstall.ts
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
  };
  
  return { canInstall: !!deferredPrompt, promptInstall };
}
```

Add install button in Header/Menu.

---

### Phase 10: Performance & Accessibility (Day 14)

**10.1 Lighthouse Audit**
```bash
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse → Run audit
```

**Target scores**: All ≥90

**10.2 Accessibility Audit**
- Run jest-axe on all components
- Manual test with screen reader (NVDA, VoiceOver)
- Keyboard navigation: Tab, Shift+Tab, Enter, Escape

**10.3 Performance Optimization**
- Code splitting: Lazy load pages
  ```typescript
  const GameCreate = lazy(() => import('./pages/GameCreate'));
  ```
- Image optimization: Convert to WebP
- Bundle analysis:
  ```bash
  npm run build -- --analyze
  ```

---

## Daily Checklist

**Every day**:
- [ ] Run tests: `npm run test`
- [ ] Run linter: `npm run lint`
- [ ] Check types: `npx tsc --noEmit`
- [ ] Test on mobile viewport (DevTools)
- [ ] Commit with conventional commit message

**Before merge**:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Lighthouse score ≥90 all metrics
- [ ] No axe violations
- [ ] Works offline
- [ ] Responsive (360px - 1920px)

---

## Useful Scripts

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Troubleshooting

### IndexedDB Not Working
- Check browser compatibility (all modern browsers support it)
- Clear IndexedDB: DevTools → Application → IndexedDB → Delete database
- Check for quota exceeded errors

### Service Worker Not Updating
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Unregister: DevTools → Application → Service Workers → Unregister
- In development: `registerType: 'autoUpdate'` in VitePWA config

### TypeScript Errors with Zustand
```typescript
// Ensure proper typing
import { create } from 'zustand';

interface State {
  // ...
}

export const useStore = create<State>()((set, get) => ({
  // ...
}));
```

### Tailwind Classes Not Working
- Ensure `content` paths in `tailwind.config.js` are correct
- Restart dev server after config changes
- Check import order: Tailwind directives before component CSS

---

## Resources

- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Zustand**: https://docs.pmnd.rs/zustand
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide
- **Vitest**: https://vitest.dev/guide
- **Playwright**: https://playwright.dev/docs/intro
- **Dexie.js**: https://dexie.org/docs
- **React Hook Form**: https://react-hook-form.com/get-started
- **Zod**: https://zod.dev

---

**Quickstart Complete**: 2026-03-03  
**Ready to implement!** 🚀
