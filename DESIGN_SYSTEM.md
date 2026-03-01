# Palrin Design System

**Version 2.0** | March 2026

A comprehensive design system for building clean, minimalist, monochrome data-centric enterprise applications for Palrin.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)
8. [Implementation Guide](#implementation-guide)

---

## Design Principles

### Core Values

**1. Clarity Over Decoration**
- Every element serves a purpose
- Minimal ornamental styling
- Focus on content and data
- Generous whitespace for breathing room

**2. Precision & Structure**
- 8px grid system for consistent spacing
- Modular, predictable layouts
- Clear visual hierarchy
- Logical information architecture

**3. Professional & Serious**
- Enterprise-focused aesthetic
- Neutral color palette with purposeful accents
- Strong typography for authority
- Subtle interactions that support usability

**4. Data-Centric**
- Designed to showcase complex information
- Readable tables and charts
- Emphasis on clarity in data visualization
- Technical, not decorative

**5. Accessible by Default**
- WCAG 2.1 AA compliant
- High contrast ratios
- Keyboard navigation support
- Screen reader friendly

---

## Color System

### Neutral Palette

Our primary color palette consists of neutral grays, providing a professional foundation that keeps focus on content.

```css
/* Light to Dark */
--color-neutral-50:  #FAFAFA  /* Backgrounds */
--color-neutral-100: #F5F5F5  /* Subtle backgrounds */
--color-neutral-200: #E5E5E5  /* Borders, dividers */
--color-neutral-300: #D4D4D4  /* Border hover states */
--color-neutral-400: #A3A3A3  /* Placeholders */
--color-neutral-500: #737373  /* Disabled text */
--color-neutral-600: #525252  /* Secondary text */
--color-neutral-700: #404040  /* Body text */
--color-neutral-800: #262626  /* Emphasis text */
--color-neutral-900: #171717  /* Headings */
--color-neutral-950: #0A0A0A  /* Deep black */
```

**Usage Guidelines:**
- **50-100**: Page backgrounds, card backgrounds
- **200-300**: Borders, dividers, subtle UI elements
- **600-700**: Body text, secondary content
- **900-950**: Headings, primary content

### Accent Colors

Used sparingly for key actions, status indicators, and strategic emphasis. Palrin uses a monochrome palette exclusively.

```css
/* Primary Action */
--color-primary:      #000000  /* Pure black */
--color-primary-dark: #000000  /* Hover state */
--color-primary-light:#404040  /* Active state */

/* Monochrome Accents */
--color-accent-black: #000000  /* Strong emphasis */
--color-accent-dark:  #262626  /* Subtle emphasis */
--color-accent-grey:  #737373  /* Disabled states */
--color-accent-light: #E5E5E5  /* Backgrounds */
--color-accent-white: #FFFFFF  /* Pure white */
```

**Usage Guidelines:**
- **Pure Black**: CTAs, primary buttons, important links
- **Neutral Dark**: Secondary actions, emphasis
- **Neutral Grey**: Disabled states, placeholders
- **Neutral Light**: Backgrounds, subtle UI elements
- Use color sparingly to maintain a clean, professional aesthetic
- Rely on typography and spacing for hierarchy, not color variations

### Accessibility

All color combinations meet WCAG 2.1 AA standards:

| Combination | Contrast Ratio | WCAG Level |
|-------------|----------------|------------|
| Neutral-900 on Neutral-50 | 16.5:1 | AAA |
| Neutral-700 on Neutral-50 | 10.4:1 | AAA |
| Black on White | 21:1 | AAA |
| Neutral-600 on White | 7.1:1 | AA |

---

## Typography

### Font Families

```css
--font-display: "Inter", system-ui, -apple-system, sans-serif;
--font-body:    "Inter", system-ui, -apple-system, sans-serif;
--font-mono:    "IBM Plex Mono", Menlo, Monaco, "Courier New", monospace;
```

**Inter** provides exceptional readability at all sizes with subtle humanist characteristics that remain professional and technical.

**IBM Plex Mono** for code snippets, technical data, and monospace requirements.

### Type Scale

Carefully calibrated scale with negative letter-spacing for display sizes:

```css
/* Size | Line Height | Letter Spacing | Weight */
h1: 3rem    / 1.2  / -0.03em / 800  (48px)
h2: 2.25rem / 1.2  / -0.025em / 700 (36px)
h3: 1.875rem / 1.2 / -0.02em / 700  (30px)
h4: 1.5rem  / 1.2  / -0.02em / 600  (24px)
h5: 1.25rem / 1.2  / -0.01em / 600  (20px)
h6: 1.125rem / 1.2 / -0.01em / 600  (18px)

Body:  1rem      / 1.5 / 0     / 400  (16px)
Small: 0.875rem  / 1.25 / 0.01em / 400 (14px)
Tiny:  0.75rem   / 1 / 0.02em / 400    (12px)
```

### Typography Guidelines

**Headings**
- Bold weights (600-800)
- Negative letter-spacing for tighter, more technical feel
- Limited line-height for prominence
- Always use neutral-900 or neutral-950 for maximum contrast

**Body Text**
- Regular weight (400)
- 1.5 line-height for readability
- Neutral-700 for main body text
- Neutral-600 for secondary/supporting text

**Code & Technical**
- Use monospace font family
- Slightly smaller than surrounding text
- Light background (neutral-100) for inline code
- White space preservation for code blocks

**Capitalization**
- Sentence case for most UI elements
- ALL CAPS for labels, badges (0.05em letter-spacing)
- Never ALL CAPS for headings or body text

---

## Spacing & Layout

### 8px Grid System

All spacing follows an 8px base unit for mathematical consistency:

```css
--spacing-unit: 0.5rem;  /* 8px */

/* Tailwind scale (in rem) */
0.5  = 4px   (0.5 * 8)
1    = 8px   (1 * 8)
2    = 16px  (2 * 8)
3    = 24px  (3 * 8)
4    = 32px  (4 * 8)
6    = 48px  (6 * 8)
8    = 64px  (8 * 8)
12   = 96px  (12 * 8)
16   = 128px (16 * 8)
```

### Container Widths

```css
.container-narrow:   768px   /* Blog posts, focused content */
.container-standard: 1280px  /* Default page width */
.container-wide:     1536px  /* Data-heavy layouts */
```

All containers include responsive horizontal padding:
- Mobile: 1rem (16px)
- Desktop: 2rem (32px)

### Section Padding

```css
.section-padding-sm: 3rem   /* 48px top/bottom */
.section-padding:    6rem   /* 96px top/bottom */
.section-padding-lg: 9rem   /* 144px top/bottom */
```

**Usage:**
- **Small**: Subsections, tight layouts
- **Default**: Standard page sections
- **Large**: Hero sections, major content blocks

### Grid Layouts

```css
.grid-2: 2 columns, 2rem gap
.grid-3: 3 columns, 2rem gap
.grid-4: 4 columns, 2rem gap

/* Responsive breakpoints */
< 640px:  All grids → 1 column
< 1024px: 3-4 column grids → 2 columns
```

### Whitespace Principles

**Generous, Purposeful Spacing**
- Minimum 2rem (32px) between major sections
- 1rem (16px) between related elements
- 0.5rem (8px) for tightly coupled items
- Never less than 4px between any elements

**Visual Breathing Room**
- Cards have internal padding of 1.5-2rem
- Text blocks never exceed 65-75 characters per line
- Margins create clear separation between content groups

---

## Components

### Buttons

#### Primary Button
```jsx
<button className="btn-primary">
  Start Free Trial
</button>
```

**Styles:**
- Background: Primary blue (#0052CC)
- Text: White, 14px, 600 weight
- Padding: 10px 20px
- Border radius: 6px
- Hover: Darker blue + translateY(-1px) + shadow
- Active: translateY(0)

**Use for:** Primary CTAs, form submissions, key actions

#### Secondary Button
```jsx
<button className="btn-secondary">
  Learn More
</button>
```

**Styles:**
- Background: White
- Border: 1px solid neutral-300
- Text: Neutral-700, 14px, 600 weight
- Hover: Neutral-50 background + darker border

**Use for:** Secondary actions, cancel buttons

#### Ghost Button
```jsx
<button className="btn-ghost">
  View Details
</button>
```

**Styles:**
- Background: Transparent
- Text: Neutral-700, 14px, 500 weight
- Hover: Neutral-100 background

**Use for:** Tertiary actions, navigation

### Cards

#### Minimal Card
```jsx
<div className="card-minimal">
  {/* Content */}
</div>
```

**Styles:**
- Background: White
- Border: 1px solid neutral-200
- Border radius: 8px
- Padding: 24px
- Hover: Subtle shadow elevation

**Use for:** Feature highlights, content blocks

#### Elevated Card
```jsx
<div className="card-elevated">
  {/* Content */}
</div>
```

**Styles:**
- Background: White
- Box shadow: Default elevation
- Border radius: 8px
- Padding: 32px
- No border

**Use for:** Prominent content, modals, important sections

### Form Inputs

```jsx
<input className="input-field" />
```

**Styles:**
- Border: 1px solid neutral-300
- Padding: 10px 14px
- Font size: 14px
- Border radius: 6px
- Focus: Blue border + shadow ring

**States:**
- Default: Neutral-300 border
- Focus: Primary blue border + rgba(0, 82, 204, 0.1) ring
- Error: Red border
- Disabled: Neutral-100 background

### Badges

```jsx
<span className="badge badge-blue">Active</span>
```

**Variants:**
- **Blue**: Information, status
- **Teal**: Alternative positive
- **Neutral**: General labels

**Styles:**
- Padding: 4px 12px
- Font size: 12px, 600 weight
- Border radius: Full (pill shape)
- Background: 10% opacity of accent color

### Navigation

#### Nav Link
```jsx
<a className="nav-link">Product</a>
```

**Styles:**
- Padding: 8px 12px
- Font size: 14px, 500 weight
- Border radius: 6px
- Color: Neutral-700
- Hover: Neutral-900 text + neutral-100 background
- Active: Primary text + primary background (8% opacity)

### Data Tables

```jsx
<table className="data-table">
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

**Styles:**
- Font size: 14px
- Headers: 12px, 600 weight, uppercase, 0.05em tracking
- Cell padding: 16px
- Border: 1px solid neutral-200 (bottom only)
- Hover: Neutral-50 background on rows

**Guidelines:**
- Left-align text columns
- Right-align numeric columns
- Minimum column width: 100px
- Zebra striping optional for long tables

### Status Indicators

```jsx
<StatusIndicator status="success" label="Active" />
```

**Styles:**
- Dot: 8px diameter, colored circle
- Label: 14px, neutral-700
- Spacing: 8px between dot and label

**Variants:**
- Success: Green
- Warning: Amber
- Error: Red
- Info: Blue

---

## Responsive Design

### Breakpoints

```css
sm:  640px   /* Small tablets, large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops, small desktops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach

All styles default to mobile, progressively enhanced for larger screens:

```jsx
{/* Mobile: stack, Desktop: side-by-side */}
<div className="flex flex-col md:flex-row">
```

### Responsive Patterns

**Navigation**
- Mobile: Hamburger menu (drawer/modal)
- Desktop: Horizontal navigation

**Grids**
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Typography**
- Mobile: Scale down 10-20%
- Desktop: Full scale
- Large screens: Maintain scale (don't exceed)

**Spacing**
- Mobile: Reduce section padding by 50%
- Desktop: Full padding

---

## Accessibility

### Keyboard Navigation

**All interactive elements must be:**
- Focusable with Tab key
- Actionable with Enter/Space
- Visually indicated when focused (focus ring)

```css
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
}
```

### Screen Readers

**Semantic HTML:**
- Use proper heading hierarchy (h1 → h2 → h3)
- `<nav>` for navigation
- `<main>` for primary content
- `<article>` for blog posts
- `<button>` for actions, `<a>` for navigation

**ARIA Labels:**
```jsx
<button aria-label="Close modal">
  <XIcon />
</button>
```

### Color Contrast

**Minimum Requirements:**
- Body text: 4.5:1 (WCAG AA)
- Large text (18px+): 3:1 (WCAG AA)
- UI components: 3:1 (WCAG AA)

**Our Standards:**
- Body text: 10:1+ (exceeds AAA)
- All interactive elements: 7:1+ (exceeds AA)

### Focus Management

- Never remove focus outlines without replacement
- Maintain logical tab order
- Trap focus in modals
- Return focus after modal closes

---

## Implementation Guide

### Setup

**1. Import the Palantir theme:**
```js
// In _app.js or layout component
import '../styles/palantir-theme.css';
```

**2. Use Tailwind config:**
The `tailwind.config.js` includes all design tokens:
- Color palette
- Typography scale
- Spacing values
- Border radius values
- Shadows

**3. Import components:**
```jsx
import { Button, Card, Header } from '@/components/palantir';
```

### Using Design Tokens

**With Tailwind classes:**
```jsx
<div className="bg-neutral-50 text-neutral-900 p-8">
  <h2 className="text-3xl font-bold text-neutral-950 mb-4">
    Title
  </h2>
  <p className="text-neutral-700 leading-relaxed">
    Body text
  </p>
</div>
```

**With CSS custom properties:**
```css
.custom-component {
  color: var(--color-neutral-900);
  background: var(--color-neutral-50);
  padding: calc(var(--spacing-unit) * 4);
  border-radius: var(--radius-lg);
}
```

### Component Composition

**Build pages from layout components:**
```jsx
<PageContainer width="standard">
  <Section padding="lg" background="white">
    <Hero 
      title="Your Title"
      subtitle="Your subtitle"
      primaryCTA="Get Started"
    />
  </Section>
  
  <Section padding="default" background="gray">
    <FeatureGrid features={features} />
  </Section>
</PageContainer>
```

### Best Practices

**DO:**
- ✅ Use neutral colors for 90% of interface
- ✅ Reserve accent colors for key actions
- ✅ Follow 8px grid for all spacing
- ✅ Use semantic HTML elements
- ✅ Test keyboard navigation
- ✅ Maintain generous whitespace

**DON'T:**
- ❌ Use multiple accent colors simultaneously
- ❌ Add decorative elements without purpose
- ❌ Use arbitrary spacing values
- ❌ Override focus states without replacement
- ❌ Reduce contrast for aesthetic reasons
- ❌ Crowd content

---

## Examples

### Complete Page Structure

```jsx
import { Header, Hero, FeatureGrid, Footer } from '@/components/palantir';

export default function Page() {
  return (
    <>
      <Header 
        logo="Palrin"
        navItems={[
          { label: 'Product', href: '/product' },
          { label: 'Blog', href: '/blog' },
        ]}
        ctaButton="Get Started"
      />

      <Hero
        title="Build Something Great"
        subtitle="Professional tools for modern teams"
        primaryCTA="Start Free Trial"
      />

      <FeatureGrid
        title="Features"
        features={[
          {
            icon: <Icon />,
            title: "Feature Name",
            description: "Feature description"
          }
        ]}
      />

      <Footer columns={footerData} />
    </>
  );
}
```

### Custom Component Example

```jsx
function CustomCard({ title, value, trend }) {
  return (
    <div className="card-elevated">
      <div className="text-sm font-medium uppercase tracking-wider text-neutral-600 mb-2">
        {title}
      </div>
      <div className="text-4xl font-bold text-neutral-950 mb-2">
        {value}
      </div>
      <div className={`text-sm ${trend > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    </div>
  );
}
```

---

## Resources

### Files Included

- `tailwind.config.js` - Design tokens and Tailwind configuration
- `styles/palantir-theme.css` - Global styles and component classes
- `components/palantir/index.jsx` - Reusable component library
- `components/palantir/pages/Homepage.jsx` - Homepage mockup
- `components/palantir/pages/ProductPage.jsx` - Product page mockup
- `components/palantir/pages/BlogPage.jsx` - Blog page mockup

### Design Reference

**Palantir Design Language Characteristics:**
- Neutral color dominance (black/white/gray)
- Strong sans-serif typography (Inter, similar to Palantir's custom fonts)
- Generous whitespace and breathing room
- Subtle, purposeful interactions
- Data-centric layouts
- Professional, technical aesthetic

### Further Reading

- [Inter Font Family](https://rsms.me/inter/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Changelog

**Version 1.0** (February 2026)
- Initial release
- Complete color system
- Typography scale
- Component library
- Page mockups
- Accessibility guidelines

---

**Design System maintained by Palrin Team**  
Last updated: February 26, 2026
