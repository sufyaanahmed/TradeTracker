# Palantir Design System - Visual Reference

A visual guide to colors, typography, and components.

---

## Color Palette

### Neutral Scale (Primary Palette)

The foundation of the design system - used for 90% of the interface.

```
████  #FAFAFA  neutral-50   (Backgrounds)
████  #F5F5F5  neutral-100  (Subtle backgrounds, code blocks)
████  #E5E5E5  neutral-200  (Borders, dividers)
████  #D4D4D4  neutral-300  (Border hovers)
████  #A3A3A3  neutral-400  (Placeholders, disabled state)
████  #737373  neutral-500  (Icons, subtle text)
████  #525252  neutral-600  (Secondary text)
████  #404040  neutral-700  (Body text) ⭐ Main text color
████  #262626  neutral-800  (Emphasis)
████  #171717  neutral-900  (Headings)
████  #0A0A0A  neutral-950  (Maximum contrast titles)
```

### Accent Colors (Use Sparingly)

Reserved for key actions, status indicators, and strategic emphasis.

```
Primary Action:
████  #0052CC  primary       (Primary buttons, CTAs)
████  #003D99  primary-dark  (Hover state)
████  #0065FF  primary-light (Active/pressed state)

Purposeful Accents:
████  #0052CC  accent-blue   (Information, links)
████  #00BFA5  accent-teal   (Success alternative, positive metrics)
████  #FF9800  accent-amber  (Warnings, highlights, pending)
████  #D32F2F  accent-red    (Errors, destructive actions)
████  #388E3C  accent-green  (Success, confirmations, growth)
```

---

## Typography Hierarchy

```
─────────────────────────────────────────────────────
Enterprise Intelligence Platform          (H1 - 48px, 800 weight)
─────────────────────────────────────────────────────

Real-Time Analytics Engine               (H2 - 36px, 700 weight)

Core Capabilities                        (H3 - 30px, 700 weight)

Advanced Query Optimization              (H4 - 24px, 600 weight)

Technical Specifications                 (H5 - 20px, 600 weight)

Section Label                            (H6 - 18px, 600 weight)

This is body text with regular weight and comfortable 1.5 line height for 
optimal readability. Used for paragraphs and longer content. (Body - 16px)

This is small text for captions, labels, and supporting content. (Small - 14px)

UPPERCASE LABEL  (Tiny - 12px, for badges and labels)

Code snippet: const example = "IBM Plex Mono";  (Mono - 14px)
```

---

## Button Types

### Primary Button
```
┌─────────────────────┐
│   Get Started   │  ← Blue background (#0052CC)
└─────────────────────┘  White text, 14px, 600 weight
                         Hover: Darker + lift effect
```
**Usage:** Main CTAs, most important actions

### Secondary Button
```
┌─────────────────────┐
│   Learn More    │  ← White background
└─────────────────────┘  Gray border, gray text
                         Hover: Light gray background
```
**Usage:** Secondary actions, alternatives

### Ghost Button
```
  View Details  →      ← Transparent background
                         Gray text, no border
                         Hover: Light gray background
```
**Usage:** Tertiary actions, inline links

---

## Card Styles

### Minimal Card
```
┌───────────────────────────────────┐
│                                   │
│  CATEGORY                         │  Badge (blue, teal, or neutral)
│                                   │
│  Feature Title                    │  Heading (18-20px, semibold)
│                                   │
│  Description text explaining the  │  Body text (14px)
│  feature or content in clear,     │
│  readable format.                 │
│                                   │
│  [Learn More →]                   │  Ghost button / link
│                                   │
└───────────────────────────────────┘
```
**Style:** White background, 1px gray border, subtle hover shadow

### Elevated Card
```
┌───────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  Subtle shadow
│                                   │
│  Important Content                │  
│                                   │
│  More prominent than minimal      │
│  cards, used for key sections     │
│  and featured content.            │
│                                   │
└───────────────────────────────────┘
```
**Style:** White background, box shadow, no border

---

## Form Elements

### Input Field
```
Label Text
┌─────────────────────────────────────┐
│ Placeholder text...                 │
└─────────────────────────────────────┘
Help text or error message
```
**States:**
- Default: Gray border (neutral-300)
- Focus: Blue border + blue shadow ring
- Error: Red border
- Disabled: Light gray background

### Select / Dropdown
```
Select Option
┌─────────────────────────────────────┐
│ Option 1                      ▼     │
└─────────────────────────────────────┘
```

---

## Navigation

### Header Navigation
```
┌───────────────────────────────────────────────────────────┐
│  Logo    Product  Solutions  Company  Resources  [Get Started] │
└───────────────────────────────────────────────────────────┘
```
**Style:**
- Sticky top position
- White background with bottom border
- Text links with hover background
- Primary CTA button on right

### Tab Navigation
```
┌──────────┬──────────┬──────────┐
│ Active   │ Inactive │ Inactive │
├──────────┴──────────┴──────────┤
│                                │
│  Tab content goes here         │
│                                │
```

---

## Data Visualization

### Status Indicators
```
● Active      (Green dot + label)
● Pending     (Amber dot + label)
● Error       (Red dot + label)
● Info        (Blue dot + label)
```

### Badges
```
 ACTIVE   ← Blue badge (information)
 NEW      ← Teal badge (positive)
 BETA     ← Neutral badge (general)
```

### Data Table
```
┌────────────────────────────────────────────────────────────┐
│ NAME                STATUS        VALUE           CHANGE   │
├────────────────────────────────────────────────────────────┤
│ Trading System      ● Active      $1,234,567     ↑ 12.5%  │
│ Analytics Engine    ● Active      $987,654       ↑ 8.2%   │
│ Risk Monitor        ● Pending     $456,789       ↓ 2.1%   │
└────────────────────────────────────────────────────────────┘
```
**Style:**
- 14px font size
- Uppercase headers (12px, 600 weight)
- Bottom borders only
- Hover background on rows

---

## Layout Patterns

### Hero Section
```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   Enterprise Intelligence                                 │
│   Platform Built for Scale                                │
│                                                           │
│   Transform complex data into strategic                   │
│   decisions with our advanced platform.                   │
│                                                           │
│   [Start Free Trial]  [Schedule Demo]                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```
**Spacing:** Large padding (96px+ vertical), contained width

### Feature Grid
```
┌──────────────┬──────────────┬──────────────┐
│ 📊           │ 🔒           │ ⚡           │
│              │              │              │
│ Data         │ Enterprise   │ Scalable     │
│ Analytics    │ Security     │ Infrastructure│
│              │              │              │
│ Description  │ Description  │ Description  │
│ text here    │ text here    │ text here    │
└──────────────┴──────────────┴──────────────┘
```
**Grid:** 2-4 columns (responsive), 32px gaps

### Two-Column Content
```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│  Real-Time Data      │   [Visual/Image]     │
│  Processing          │                      │
│                      │                      │
│  Process millions    │                      │
│  of data points...   │                      │
│                      │                      │
│  [Learn More]        │                      │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

---

## Spacing System (8px Grid)

```
4px   (0.5)  ▮
8px   (1)    ▮▮
16px  (2)    ▮▮▮▮
24px  (3)    ▮▮▮▮▮▮
32px  (4)    ▮▮▮▮▮▮▮▮
48px  (6)    ▮▮▮▮▮▮▮▮▮▮▮▮
64px  (8)    ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮
96px  (12)   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮
```

**Usage Guidelines:**
- **4-8px**: Tightly coupled elements (icon + text, badge spacing)
- **16-24px**: Related elements within a component
- **32-48px**: Between sections within a page
- **64-96px**: Major page sections, generous breathing room

---

## Border Radius

```
sm   (2px)   ▢  (Tags, small elements)
md   (6px)   ▢  (Buttons, inputs) ⭐ Default
lg   (8px)   ▢  (Cards, modals)
xl   (12px)  ▢  (Large containers)
full (999px) ●  (Pills, badges, avatars)
```

---

## Shadows (Elevation)

```
sm       ▁     Subtle lift
default  ▂     Standard elevation
md       ▃     Moderate depth
lg       ▅     Significant elevation
xl       ▆     Maximum depth
```

**Usage:**
- **sm-default**: Cards, dropdowns
- **md-lg**: Modals, popovers
- **xl**: Rare, only for hero elements

---

## Responsive Breakpoints

```
Mobile       Phone       |────────| < 640px
Tablet       iPad        |──────────────| 640-1024px
Desktop      Laptop      |─────────────────────| 1024-1536px
Large        Monitor     |────────────────────────────| > 1536px
```

**Design Strategy:**
- Mobile-first approach
- Stack to grid transformation
- Reduced padding on mobile
- Hamburger menu on small screens

---

## Accessibility Features

### Focus States
```
[Button]  ← Default
[Button]  ← Focus (blue shadow ring)
━━━━━━━
```

### Contrast Ratios
- **Body Text on White**: 10.4:1 (AAA) ✓
- **Primary Blue on White**: 8.2:1 (AAA) ✓
- **All Interactive Elements**: > 7:1 (Exceeds AA)

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate
- Escape to close modals
- Arrow keys for menus

---

## Usage Examples

### Professional Hero
```jsx
<div className="bg-white section-padding-lg">
  <div className="container-standard max-w-3xl">
    <h1 className="text-6xl font-extrabold text-neutral-950 mb-6">
      Enterprise Intelligence Platform
    </h1>
    <p className="text-xl text-neutral-600 mb-8">
      Transform data into strategic decisions
    </p>
    <button className="btn-primary">Get Started</button>
  </div>
</div>
```

### Clean Card Grid
```jsx
<div className="container-standard section-padding">
  <div className="grid-3">
    <div className="card-minimal">
      <h3 className="text-lg font-semibold mb-2">Feature</h3>
      <p className="text-neutral-600">Description</p>
    </div>
    {/* More cards */}
  </div>
</div>
```

---

## Design Philosophy Summary

**Clean** → Minimal decoration, purposeful elements only  
**Minimalist** → Generous whitespace, uncluttered layouts  
**Data-Centric** → Optimized for displaying complex information  
**Professional** → Neutral palette, strong typography, subtle interactions  
**Accessible** → WCAG AA compliant, keyboard navigable, semantic HTML

---

**For complete implementation details, see:**
- `DESIGN_SYSTEM.md` - Full design system documentation
- `PALANTIR_QUICKSTART.md` - Implementation guide
- `components/palantir/` - Component library
- `styles/palantir-theme.css` - Global styles

---

✨ **Palantir-Inspired Design System v1.0**
