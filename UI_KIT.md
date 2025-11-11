# Blink UI Kit

A small, focused set of reusable UI components built with Tailwind CSS.

## 📋 Design System Location

**All colors, fonts, and theme configuration are in:** `src/app/globals.css`

- Uses Tailwind CSS v4 `@theme` directive
- All colors are HSL format
- Base typography styles set in `@layer base`

## 🎨 Theme Variables

### Colors
```css
--color-primary: 214 95% 45%        /* Blue */
--color-accent: 25 95% 55%          /* Orange */
--color-text-primary: 215 25% 10%
--color-text-secondary: 215 15% 40%
--color-background: 0 0% 100%
--color-border: 215 20% 90%
```

### Typography
```css
--font-sans: 'Inter', system-ui, ...
--font-size-hero: 4rem
--font-size-h1: 3rem
--font-size-h2: 2.25rem
--font-size-base: 1rem
```

### Spacing
```css
--spacing-section: 5rem
--spacing-container-max: 1400px
```

## 🧩 UI Components

All components are in `src/components/ui/`

### 1. Modal

Base modal/dialog component with backdrop and overlay.

```tsx
import { Modal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="p-8">
    <h2>Modal Content</h2>
    <p>Your content here...</p>
  </div>
</Modal>
```

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `children`: ReactNode (required)
- `className`: string (optional)

**Features:**
- Backdrop click to close
- Escape key to close
- Prevents body scroll when open
- Smooth animations

### 2. BookDemoModal

Pre-built modal for booking demos with form fields. **Automatically saves to Supabase and shows success modal.**

```tsx
import { BookDemoModal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>Book a Demo</button>

<BookDemoModal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
/>
```

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)

**Form Fields:**
- Company Name
- Your Name
- Email
- Phone Number
- Industry (dropdown)

**Features:**
- Beautiful image left panel (uses `/images/demo-image.jpeg`)
- Form validation
- Saves to Supabase `demo_requests` table
- Shows success modal after submission
- Loading state with spinner
- Error handling
- Responsive design

**Database Setup Required:**
See `DATABASE_SETUP.md` for instructions on creating the `demo_requests` table.

### 3. SuccessModal

Success confirmation modal with checkmark icon.

```tsx
import { SuccessModal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<SuccessModal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Success!"
  message="Your request has been received."
/>
```

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string (optional, default: "Request Received!")
- `message`: string (optional, default: "Thank you for your interest...")

### 4. Button

Versatile button with 4 variants and 3 sizes.

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" size="lg" href="/signup">
  Get Started
</Button>

// Secondary button
<Button variant="secondary" size="md" onClick={handleClick}>
  Learn More
</Button>

// Outline button
<Button variant="outline" size="sm">
  Cancel
</Button>

// Ghost button
<Button variant="ghost" size="sm" href="/login">
  Sign In
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `href`: string (optional - makes it a link)
- `onClick`: function (optional - for button behavior)
- `icon`: ReactNode (optional - icon element)

### 5. Badge

Small indicators for status or notifications.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" icon={<DotIcon />}>
  Beta
</Badge>

<Badge variant="accent">
  New
</Badge>

<Badge variant="neutral">
  Featured
</Badge>
```

**Props:**
- `variant`: 'primary' | 'accent' | 'neutral'
- `icon`: ReactNode (optional)

### 6. Card

Flexible container with variants and hover effects.

```tsx
import { Card } from '@/components/ui';

<Card variant="primary" hover>
  <h3>For Employers</h3>
  <p>Find qualified workers fast.</p>
</Card>

<Card variant="ghost">
  <p>Subtle card styling</p>
</Card>
```

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'ghost'
- `hover`: boolean (enables hover animation)

### 7. IconContainer

Rounded containers for icons with gradient and translucent support.

```tsx
import { IconContainer } from '@/components/ui';

// Solid backgrounds
<IconContainer variant="primary" size="lg">
  <YourIcon />
</IconContainer>

// Gradient background
<IconContainer variant="gradient" size="lg">
  <YourIcon />
</IconContainer>

// Translucent backgrounds (light/subtle)
<IconContainer variant="primary-light" size="md">
  <CheckIcon />
</IconContainer>

<IconContainer variant="accent-light" size="md">
  <StarIcon />
</IconContainer>
```

**Props:**
- `variant`: 'primary' | 'accent' | 'gradient' | 'primary-light' | 'accent-light'
- `size`: 'sm' | 'md' | 'lg' | 'xl'

**Variants:**
- `primary`: Solid blue background, white icon
- `accent`: Solid orange background, white icon
- `gradient`: Blue gradient background, white icon
- `primary-light`: Translucent blue background (10% opacity), blue icon
- `accent-light`: Translucent orange background (10% opacity), orange icon

### 8. SectionHeader

Consistent section headers with optional descriptions.

```tsx
import { SectionHeader } from '@/components/ui';

<SectionHeader
  title="How It Works"
  description="Simple, fast, and effective. Get started in minutes."
  align="center"
/>
```

**Props:**
- `title`: string (required)
- `description`: string (optional)
- `badge`: ReactNode (optional)
- `align`: 'left' | 'center'

### 9. FeatureCard

Pre-styled cards for features.

```tsx
import { FeatureCard } from '@/components/ui';

<FeatureCard
  icon={<CheckIcon />}
  title="Verified Skills"
  description="All workers are pre-verified."
/>
```

**Props:**
- `icon`: ReactNode
- `title`: string
- `description`: string

### 10. StepCard

Cards for displaying process steps.

```tsx
import { StepCard } from '@/components/ui';

// Solid icon background
<StepCard
  variant="primary"
  icon={<UserIcon />}
  title="Create Profile"
  description="Sign up and tell us about your needs."
/>

// Translucent icon background (subtle look)
<StepCard
  variant="primary-light"
  icon={<UserIcon />}
  title="Create Profile"
  description="Sign up and tell us about your needs."
/>
```

**Props:**
- `variant`: 'primary' | 'accent' | 'primary-light' | 'accent-light' | 'gradient'
- `icon`: ReactNode
- `title`: string
- `description`: string

**Note:** Uses `IconContainer` internally, so it supports all IconContainer variants.

## 📁 File Structure

```
src/
├── app/
│   └── globals.css          ← THEME CONFIG HERE (colors, fonts, etc.)
├── components/
│   ├── ui/                  ← UI KIT COMPONENTS
│   │   ├── Badge.tsx
│   │   ├── BookDemoModal.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── IconContainer.tsx
│   │   ├── Modal.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── StepCard.tsx
│   │   ├── SuccessModal.tsx
│   │   └── index.ts
│   └── landing/             ← Page-specific components
│       ├── Container.tsx
│       ├── HeroSection.tsx
│       ├── HowItWorksSection.tsx
│       └── ...
```

## 🎯 Usage Examples

### Book a Demo Flow

```tsx
'use client';

import { useState } from 'react';
import { Button, BookDemoModal } from '@/components/ui';

export function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Book a Demo
      </Button>

      <BookDemoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
```

### Complete Section

```tsx
import { Container, SectionHeader, FeatureCard } from '@/components/ui';

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <SectionHeader
          title="Why Choose Us"
          description="The smarter way to hire."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Icon1 />}
            title="Feature 1"
            description="Description here"
          />
          {/* More features... */}
        </div>
      </Container>
    </section>
  );
}
```

### Button Group

```tsx
<div className="flex gap-4">
  <Button variant="primary" size="lg" href="/signup">
    Get Started
  </Button>
  <Button variant="outline" size="lg" href="/learn-more">
    Learn More
  </Button>
</div>
```

## ✨ Key Benefits

1. **Tailwind-First**: Uses Tailwind classes, not custom CSS
2. **Theme in CSS**: All config in `globals.css` using `@theme`
3. **Small & Focused**: Just 7 core components
4. **Type-Safe**: Full TypeScript support
5. **Easy to Extend**: Add variants by updating component props

## 🔄 How to Modify

### Change Primary Color

```css
/* src/app/globals.css */
@theme {
  --color-primary: 220 90% 50%;  /* Change this */
}
```

### Add New Button Variant

```tsx
/* src/components/ui/Button.tsx */
const variantStyles = {
  // ... existing variants
  success: 'bg-green-600 hover:bg-green-700 text-white',
};
```

### Modify Font

```css
/* src/app/globals.css */
@theme {
  --font-sans: 'Your Font', system-ui, sans-serif;
}
```

## 🚀 Quick Start

1. **Import**: `import { Button, Card } from '@/components/ui'`
2. **Use**: `<Button variant="primary">Click Me</Button>`
3. **Customize**: Edit colors in `globals.css`

That's it! Keep it simple, keep it consistent.

