# Palantir Design System - Quick Start Guide

Get started with the Palantir-inspired design system in minutes.

## 📦 What's Included

Your design system now includes:

1. **Updated Tailwind Configuration** (`tailwind.config.js`)
   - Neutral color palette (50-950 scale)
   - Purposeful accent colors
   - Professional typography scale
   - 8px grid spacing system

2. **Global Styles** (`styles/palantir-theme.css`)
   - CSS custom properties for all design tokens
   - Pre-built component classes
   - Responsive utilities
   - Accessibility features

3. **Component Library** (`components/palantir/index.jsx`)
   - Header & Footer
   - Hero sections
   - Feature grids
   - Cards, Buttons, Inputs
   - Data tables
   - Layouts

4. **Page Mockups** (`components/palantir/pages/`)
   - Homepage example
   - Product/Feature page
   - Blog page

5. **Design Documentation** (`DESIGN_SYSTEM.md`)
   - Complete design system reference
   - Usage guidelines
   - Accessibility standards

## 🚀 Quick Implementation

### Step 1: Import the Theme

Add to your main app file (`pages/_app.js`):

```jsx
import '../styles/palantir-theme.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

### Step 2: Use Tailwind Classes

Start using the new design tokens in your components:

```jsx
export default function Example() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container-standard section-padding">
        <h1 className="text-4xl font-bold text-neutral-950 mb-4">
          Clean, Professional Title
        </h1>
        <p className="text-lg text-neutral-700 mb-8">
          Clear, readable body text with generous line height.
        </p>
        <button className="btn-primary">
          Get Started
        </button>
      </div>
    </div>
  );
}
```

### Step 3: Import Pre-built Components

Use the component library for faster development:

```jsx
import { Header, Hero, Card, Button } from '@/components/palantir';

export default function Page() {
  return (
    <>
      <Header 
        logo="Your Brand"
        navItems={[
          { label: 'Product', href: '/product' },
          { label: 'About', href: '/about' },
        ]}
        ctaButton="Sign Up"
      />

      <Hero
        title="Your Professional Title"
        subtitle="Supporting text that explains your value proposition"
        primaryCTA="Get Started"
        secondaryCTA="Learn More"
      />

      <div className="container-standard section-padding">
        <div className="grid-3">
          <Card
            title="Feature One"
            description="Clean card with hover effect"
            cta="Learn More"
          />
          {/* Add more cards */}
        </div>
      </div>
    </>
  );
}
```

## 🎨 Design Tokens Reference

### Colors (Most Used)

```jsx
// Backgrounds
className="bg-white"           // Pure white
className="bg-neutral-50"      // Off-white background
className="bg-neutral-100"     // Subtle gray background

// Text
className="text-neutral-950"   // Headings (deep black)
className="text-neutral-900"   // Emphasis text
className="text-neutral-700"   // Body text
className="text-neutral-600"   // Secondary text

// Accents
className="text-primary"       // Primary blue
className="bg-primary"         // Primary button background
className="text-accent-green"  // Success states
className="text-accent-red"    // Error states
```

### Typography

```jsx
// Headings
className="text-5xl font-extrabold"  // Large hero (h1)
className="text-4xl font-bold"       // Section heading (h2)
className="text-3xl font-bold"       // Subsection (h3)
className="text-xl font-semibold"    // Card titles

// Body
className="text-lg"           // Large body text
className="text-base"         // Regular body (16px)
className="text-sm"           // Small text (14px)
```

### Spacing

```jsx
// Padding/Margin (8px grid)
className="p-4"    // 32px all sides
className="px-8"   // 64px horizontal
className="py-6"   // 48px vertical
className="space-y-4"  // 32px between children

// Gaps (for flex/grid)
className="gap-6"      // 48px gap
className="gap-8"      // 64px gap
```

## 🧩 Common Patterns

### Full Page Layout

```jsx
<div className="min-h-screen bg-white">
  {/* Header */}
  <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
    {/* Navigation */}
  </header>

  {/* Content */}
  <main>
    <section className="section-padding bg-white">
      <div className="container-standard">
        {/* Your content */}
      </div>
    </section>
  </main>

  {/* Footer */}
  <footer className="border-t border-neutral-200 bg-neutral-50">
    {/* Footer content */}
  </footer>
</div>
```

### Content Section

```jsx
<section className="section-padding bg-neutral-50">
  <div className="container-standard">
    {/* Section Header */}
    <div className="mb-12 max-w-2xl">
      <h2 className="mb-4 text-4xl font-bold text-neutral-950">
        Section Title
      </h2>
      <p className="text-lg text-neutral-600">
        Supporting description text
      </p>
    </div>

    {/* Content Grid */}
    <div className="grid-3">
      {/* Cards or content */}
    </div>
  </div>
</section>
```

### Card Component

```jsx
<div className="card-minimal">
  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
    Card Title
  </h3>
  <p className="text-neutral-600 mb-4">
    Card description text
  </p>
  <button className="btn-ghost">
    Learn More →
  </button>
</div>
```

### Form Input

```jsx
<div className="w-full">
  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
    Email Address
  </label>
  <input
    type="email"
    placeholder="you@company.com"
    className="input-field"
  />
  <p className="mt-1.5 text-sm text-neutral-500">
    We'll never share your email
  </p>
</div>
```

## 📱 Responsive Design

Use Tailwind's responsive prefixes:

```jsx
<div className="
  flex flex-col          // Mobile: stack vertically
  md:flex-row            // Tablet+: side by side
  gap-6                  // 48px gap on all screens
">
  <div className="
    w-full                // Mobile: full width
    md:w-1/2              // Tablet+: half width
  ">
    {/* Content */}
  </div>
</div>
```

## ♿ Accessibility Checklist

- ✅ All interactive elements have focus states
- ✅ Color contrast meets WCAG AA (4.5:1 for text)
- ✅ Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ✅ Keyboard navigation works everywhere
- ✅ ARIA labels for icon-only buttons
- ✅ Form inputs have associated labels

## 🎯 Design Principles Reminder

When building with this system:

1. **Prioritize Clarity** - Every element should have a purpose
2. **Use Whitespace Generously** - Let content breathe
3. **Neutral by Default** - Use accent colors sparingly
4. **Strong Typography** - Bold headings, readable body text
5. **Subtle Interactions** - Hover effects that support, not distract
6. **Data First** - Design to showcase information clearly

## 📖 View Complete Examples

Check out the complete page mockups:
- **Homepage**: `components/palantir/pages/Homepage.jsx`
- **Product Page**: `components/palantir/pages/ProductPage.jsx`
- **Blog Page**: `components/palantir/pages/BlogPage.jsx`

## 🔧 VS Code Setup (Optional)

Install Tailwind CSS IntelliSense extension for autocomplete:
```
ext install bradlc.vscode-tailwindcss
```

## 📚 Full Documentation

See `DESIGN_SYSTEM.md` for:
- Complete color system
- Typography specifications
- Spacing guidelines
- Component documentation
- Accessibility standards
- Implementation best practices

---

## Next Steps

1. Review the page mockups in `components/palantir/pages/`
2. Start implementing your pages using the component library
3. Refer to `DESIGN_SYSTEM.md` for detailed guidelines
4. Test your implementation for accessibility

**Questions?** Refer to the comprehensive `DESIGN_SYSTEM.md` documentation.

---

✨ **Enjoy building with your new Palantir-inspired design system!**
