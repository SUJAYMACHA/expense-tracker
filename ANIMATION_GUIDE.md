# 🎨 Animation Guide

## Libraries Installed

### 1. **Framer Motion** - Advanced React Animations
- Most popular React animation library
- Powerful declarative API
- Physics-based animations
- Gesture support (drag, hover, tap)

### 2. **Tailwind CSS Animate** - Extended Tailwind Utilities
- Additional Tailwind animation classes
- Easy to use with className
- No JavaScript required

---

## 🚀 Framer Motion Usage

### Installation
```bash
npm install framer-motion
```

### Basic Examples

#### Fade In
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

#### Slide Up
```tsx
<motion.div
  initial={{ y: 50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

#### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

#### Drag
```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 100, top: 0, bottom: 100 }}
>
  Drag me!
</motion.div>
```

#### Stagger Children
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Infinite Loop
```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    repeatType: "loop"
  }}
>
  Spinning!
</motion.div>
```

---

## ✨ Tailwind CSS Animations

### Built-in Tailwind Animations
- `animate-spin` - Continuous rotation
- `animate-ping` - Expanding circle
- `animate-pulse` - Fade in/out
- `animate-bounce` - Bounce up and down

### Custom Animations (Added)
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top
- `animate-float` - Floating effect
- `animate-glow` - Glowing shadow
- `animate-wiggle` - Side to side wiggle
- `animate-shake` - Shake effect
- `animate-flip` - 360° flip
- `animate-scale-up` - Scale up from small
- `animate-slide-in-right` - Slide from right
- `animate-slide-in-left` - Slide from left
- `animate-rotate-in` - Rotate and scale in

### Usage Examples

```html
<!-- Fade in on load -->
<div className="animate-fade-in">Content</div>

<!-- Slide up on load -->
<div className="animate-slide-up">Content</div>

<!-- Animate on hover -->
<button className="hover:animate-bounce">Hover Me</button>

<!-- Combine with delays -->
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
  Delayed Content
</div>

<!-- Infinite animations -->
<div className="animate-float">Floating</div>
<div className="animate-pulse">Pulsing</div>
```

---

## 🎯 Combining Both

### Animated Card with Hover
```tsx
<motion.div
  className="card animate-fade-in"
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Card Content
</motion.div>
```

### Button with Multiple Effects
```tsx
<motion.button
  className="btn-primary hover:animate-glow"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### Staggered List with Tailwind
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s` }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

---

## 🎪 Advanced Patterns

### Page Transitions
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Modal Animation
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="card"
      >
        Modal Content
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Loading Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

---

## 📊 Performance Tips

1. **Use `transform` and `opacity`** - These properties are GPU-accelerated
2. **Avoid animating `width`, `height`, `top`, `left`** - These trigger layout recalculations
3. **Use `will-change` sparingly** - Only for elements that will definitely animate
4. **Reduce motion for accessibility**:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

---

## 🎨 Animation Timing Functions

### Framer Motion Easing
- `"linear"` - Constant speed
- `"easeIn"` - Slow start, fast end
- `"easeOut"` - Fast start, slow end  
- `"easeInOut"` - Slow start and end
- `"circIn"`, `"circOut"`, `"backIn"`, `"backOut"`, etc.

### Spring Physics
```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,  // Higher = stiffer spring
    damping: 20,      // Higher = less oscillation
    mass: 1           // Higher = heavier object
  }}
/>
```

---

## 🔗 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation)
- [Animation Demo Component](./src/components/AnimationDemo.tsx)

---

## 🎭 See It In Action

Import and use the `AnimationDemo` component to see all animations in action:

```tsx
import { AnimationDemo } from './components/AnimationDemo';

// In your route or page:
<AnimationDemo />
```
