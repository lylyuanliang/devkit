# Tailwind Component Library Documentation

## Overview
Reusable components built with Tailwind CSS for consistent styling across the application.

## Components

### Button
Primary interactive element with multiple variants and sizes.

**Variants:**
- `primary` (default): Blue background, white text
- `secondary`: Gray background, dark text
- `danger`: Red background, white text

**Sizes:**
- `sm`: Small padding, small text
- `md` (default): Medium padding, small text
- `lg`: Large padding, base text

**Usage:**
```tsx
import { Button } from './components';

<Button variant="primary" size="md">Click me</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### Input
Text input field with optional label and error message.

**Props:**
- `label`: Optional label text
- `error`: Optional error message
- All standard HTML input attributes

**Usage:**
```tsx
import { Input } from './components';

<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error={emailError}
/>
```

### Card
Container component for grouping content.

**Usage:**
```tsx
import { Card } from './components';

<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Table
Table component with header, rows, and cells.

**Usage:**
```tsx
import { Table, TableHeader, TableRow, TableCell } from './components';

<Table>
  <TableHeader>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header>Status</TableCell>
    </TableRow>
  </TableHeader>
  <tbody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </tbody>
</Table>
```

## Styling Features

- **Dark Mode Support**: All components automatically support dark mode via `dark:` prefix
- **Responsive**: Components adapt to different screen sizes
- **Accessibility**: Proper semantic HTML and ARIA attributes
- **Transitions**: Smooth color and state transitions
- **Focus States**: Clear focus indicators for keyboard navigation

## Theme Colors

- Primary: Blue (600/700)
- Secondary: Gray (200/700)
- Danger: Red (600/700)
- Background: White/Slate
- Text: Gray (900/100)
- Border: Gray (200/700)

## Customization

All components accept a `className` prop for additional Tailwind classes:

```tsx
<Button className="w-full">Full Width Button</Button>
<Card className="shadow-lg">Enhanced Card</Card>
```
