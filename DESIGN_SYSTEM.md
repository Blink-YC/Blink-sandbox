# Blink Design System

This document outlines the design system and reusable UI components for the Blink platform.

## Table of Contents
- [Theme Configuration](#theme-configuration)
- [UI Components](#ui-components)
- [Usage Examples](#usage-examples)
- [File Structure](#file-structure)

## Theme Configuration

**The centralized theme configuration is located at `src/app/globals.css`** using Tailwind CSS v4's `@theme` directive. This file contains all design tokens including colors, typography, spacing, shadows, and more.

### Colors (HSL Format)

All colors are defined in HSL format in `globals.css`:

```css
@theme {
  --color-primary: 214 95% 45%;        /* Blue */
  --color-accent: 25 95% 55%;          /* Orange */
  --color-text-primary: 215 25% 10%;
  --color-text-secondary: 215 15% 40%;
  --color-background: 0 0% 100%;
  --color-border: 215 20% 90%;
}
```

Use in Tailwind: `bg-blue-600`, `text-orange-500`, `border-gray-200`

### Typography

Defined in `globals.css`:

```css
@theme {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-hero: 4rem;        /* 64px */
  --font-size-h1: 3rem;          /* 48px */
  --font-size-h2: 2.25rem;       /* 36px */
  --font-size-base: 1rem;        /* 16px */
}
```

Base typography styles are set in `@layer base` for all headings and paragraphs.

### Spacing

```css
@theme {
  --spacing-section: 5rem;       /* 80px */
  --spacing-container-max: 1400px;
}
```

## UI Components

### Container

A responsive container component that provides consistent padding and max-width across all sections.

```tsx
import { Container } from '@/components/landing/Container';

<Container>
  {/* Your content */}
</Container>
```

### Button

Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `href`: Optional link URL
- `onClick`: Optional click handler
- `icon`: Optional icon element

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" href="/signup">
  Get Started
</Button>
```

### Badge

Small status or notification badges with different variants.

**Props:**
- `variant`: 'primary' | 'accent' | 'neutral'
- `icon`: Optional icon element

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" icon={<Icon />}>
  Now in Beta
</Badge>
```

### Card

Flexible card component with different variants and optional hover effects.

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'ghost'
- `hover`: boolean (enables hover animations)

```tsx
import { Card } from '@/components/ui';

<Card variant="primary" hover>
  {/* Card content */}
</Card>
```

### IconContainer

Circular or rounded icon container with gradient backgrounds.

**Props:**
- `variant`: 'primary' | 'accent' | 'gradient'
- `size`: 'sm' | 'md' | 'lg' | 'xl'

```tsx
import { IconContainer } from '@/components/ui';

<IconContainer variant="gradient" size="lg">
  <YourIcon />
</IconContainer>
```

### SectionHeader

Consistent section headers with optional descriptions and badges.

**Props:**
- `title`: string (required)
- `description`: string (optional)
- `badge`: ReactNode (optional)
- `align`: 'left' | 'center'

```tsx
import { SectionHeader } from '@/components/ui';

<SectionHeader
  title="How It Works"
  description="Simple, fast, and effective. Get started in minutes."
  align="center"
/>
```

### FeatureCard

Pre-styled card for displaying features with icon, title, and description.

**Props:**
- `icon`: ReactNode (required)
- `title`: string (required)
- `description`: string (required)

```tsx
import { FeatureCard } from '@/components/ui';

<FeatureCard
  icon={<YourIcon />}
  title="Fast Matching"
  description="Connect with opportunities in seconds."
/>
```

### StepCard

Pre-styled card for displaying steps in a process with numbered indicators.

**Props:**
- `icon`: ReactNode (required)
- `title`: string (required)
- `description`: string (required)
- `variant`: 'primary' | 'accent'

```tsx
import { StepCard } from '@/components/ui';

<StepCard
  variant="primary"
  icon={<YourIcon />}
  title="Create Profile"
  description="Sign up and tell us about your needs."
/>
```

## Usage Examples

### Complete Section Example

```tsx
import { Container, SectionHeader, FeatureCard } from '@/components/ui';

export function FeaturesSection() {
  const features = [
    {
      icon: <Icon1 />,
      title: "Feature 1",
      description: "Description 1"
    },
    // ... more features
  ];

  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <SectionHeader
          title="Our Features"
          description="Everything you need to succeed."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
```

## File Structure

```
src/
├── app/
│   ├── globals.css           # ⭐ THEME CONFIG HERE (colors, fonts, spacing)
│   └── page.tsx              # Landing page entry point
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── IconContainer.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── StepCard.tsx
│   │   └── index.ts          # Barrel export
│   └── landing/              # Landing page specific components
│       ├── Container.tsx
│       ├── HeroSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── WhyChooseUsSection.tsx
│       ├── ForEmployersWorkersSection.tsx
│       ├── NavigationHeader.tsx
│       ├── FooterSection.tsx
│       └── index.ts          # Barrel export
```

## Benefits of This Architecture

1. **Consistency**: All UI elements use the same design tokens from `globals.css`
2. **Maintainability**: Update colors/fonts in one place (`globals.css`)
3. **Reusability**: Components can be used across different pages
4. **Tailwind-First**: Uses Tailwind CSS v4 features natively
5. **Type Safety**: Full TypeScript support with proper types
6. **Developer Experience**: Clean imports via barrel exports
7. **Scalability**: Easy to add new components and variants
8. **Performance**: No extra JS files for theme config

## Extending the System

### Adding a New Color

```css
/* src/app/globals.css */
@theme {
  /* ... existing colors */
  --color-success: 142 76% 36%;        /* Green */
  --color-success-hover: 142 76% 31%;
}
```

Then use it in Tailwind classes: `bg-green-600`, `hover:bg-green-700`

### Creating a New Component Variant

```tsx
// src/components/ui/Button.tsx
const variantStyles: Record<ButtonVariant, string> = {
  // ... existing variants
  success: 'bg-green-600 hover:bg-green-700 text-white',
};
```

### Modifying Base Typography

```css
/* src/app/globals.css */
@layer base {
  h1 {
    font-size: var(--font-size-h1);
    font-weight: 800;  /* Make bolder */
    margin-bottom: 2rem;  /* More spacing */
  }
}
```

## Best Practices

1. **Use semantic naming**: Name components based on their purpose, not appearance
2. **Keep components small**: Each component should have a single, clear responsibility
3. **Use composition**: Build complex UIs from simpler components
4. **Leverage TypeScript**: Define proper types for all props
5. **Document variants**: Add comments explaining when to use each variant
6. **Test responsiveness**: Ensure components work across all screen sizes
7. **Maintain accessibility**: Include proper ARIA labels and keyboard navigation

## Questions or Issues?

For questions about the design system or to propose changes, please reach out to the development team or open an issue in the project repository.

