# Rising Promise Website - Content Management Guide

Welcome! This guide will show you how to update your Rising Promise website content by editing a single configuration file. Everything you need to edit is in: `client/src/lib/siteConfig.ts`.

---

## 🚀 Quick Start

### How to Make Changes

1. Open the file: `client/src/lib/siteConfig.ts`
2. Find the section you want to edit (use the comments as your guide)
3. Change the text between the quotes `"like this"`
4. Save the file
5. The website will automatically reload with your changes

**That's it!** No coding knowledge required.

---

## ✏️ Editing Content

### Example: Changing the Hero Headline

**BEFORE:**
```typescript
hero: {
  headline: "Everyone Deserves a Fighting Chance",
  ...
}
```

**AFTER:**
```typescript
hero: {
  headline: "Building Futures, One Person at a Time",
  ...
}
```

### What You Can Edit in siteConfig.ts

- **All Text**: Headlines, paragraphs, button labels, team member quotes
- **All Images**: Hero backgrounds, team photos
- **All Links**: Navigation menus, social media, email addresses
- **Feature Toggles**: Turn pages and features on/off

### Common Edits

#### Update Organization Contact Info

```typescript
organization: {
  name: "Rising Promise",
  email: "info@risingpromise.org",      // ← Change this
  phone: "(555) 123-4567",              // ← Change this
  address: "123 Hope Street...",        // ← Change this
}
```

#### Update Social Media Links

```typescript
social: {
  facebook: "https://facebook.com/risingpromise",    // ← Change this
  instagram: "https://instagram.com/risingpromise",  // ← Change this
  linkedin: "https://linkedin.com/company/risingpromise",
  twitter: "https://twitter.com/risingpromise",
}
```

#### Update Team Member Information

```typescript
members: [
  {
    name: "Jason Pilgrim",                    // ← Change this
    title: "Founder",                         // ← Change this
    photo: "https://i.pravatar.cc/400?img=12", // ← Change this
    quote: "I've spent my life building...",  // ← Change this
  },
  // Add more team members by copying this pattern
]
```

---

## 🖼️ Updating Images

### Hero Background Images

Replace the image URL with your own:

```typescript
hero: {
  backgroundImage: "https://images.unsplash.com/photo-...",
  // ↑ Replace with your image URL
}
```

**Recommended image sizes:**
- Hero images: 1920x1080 pixels (minimum)
- Team photos: 400x400 pixels (square)

### Using Your Own Images

Upload your images to a hosting service like:
- [Imgur](https://imgur.com)
- [Cloudinary](https://cloudinary.com)
- [Unsplash](https://unsplash.com) (for stock photos)

Then copy the direct image URL and paste it into siteConfig.ts.

### Image Best Practices

✅ **DO:**
- Use high-quality, optimized images
- Show hopeful, forward-looking imagery
- Use diverse, authentic photos

❌ **DON'T:**
- Use copyrighted images without permission
- Use sad or desperate imagery
- Use low-resolution images

---

## 🎨 Changing Colors

Colors are defined in `client/src/index.css`. Find these lines:

```css
:root {
  --primary: 197 92% 49%;        /* Sky Blue #1B9CE5 */
  --secondary: 210 40% 12%;      /* Deep Navy #0D1B2A */
  --accent: 42 98% 49%;          /* Gold #F4A300 */
}
```

To change colors:
1. Choose your color's hex code (use [Coolors](https://coolors.co))
2. Convert it to HSL format (use a color converter tool)
3. Update the HSL values (format: hue saturation% lightness%)

---

## ➕ Adding Content

### Adding a New Team Member

```typescript
team: {
  members: [
    // ... existing members ...
    {
      name: "New Person Name",
      title: "Their Title",
      photo: "https://path-to-their-photo.jpg",
      quote: "Their inspiring quote goes here.",
    },
  ]
}
```

### Adding Navigation Items

```typescript
navigation: {
  menuItems: [
    // ... existing items ...
    { text: "New Page", href: "#new-section" },
  ]
}
```

### Adding Impact Stats

```typescript
stats: [
  // ... existing stats ...
  { number: "50+", label: "New Stat", sublabel: "Optional detail" },
]
```

---

## 🔧 Troubleshooting

### Changes Not Showing Up?

1. **Save the file** - Make sure you saved `siteConfig.ts`
2. **Check the browser** - The dev server should auto-reload
3. **Hard refresh** - Windows/Linux: Ctrl + Shift + R, Mac: Cmd + Shift + R

### Common Mistakes

❌ **WRONG** (missing comma):
```typescript
hero: {
  headline: "My Headline"
  subheadline: "My Subheadline"
}
```

✅ **CORRECT:**
```typescript
hero: {
  headline: "My Headline",     // ← Comma here
  subheadline: "My Subheadline"
}
```

---

## 📁 File Structure

```
rising-promise/
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   └── siteConfig.ts    ← **EDIT THIS FILE FOR ALL CONTENT**
│   │   ├── pages/
│   │   │   └── home.tsx         ← Homepage component
│   │   ├── index.css            ← Colors and styling
│   │   └── App.tsx              ← Main app file
│   └── index.html               ← HTML template
├── shared/
│   └── schema.ts                ← TypeScript types (don't edit)
└── README.md                    ← This file
```

---

## 💡 Pro Tips

1. **Test changes immediately** - Save and check the browser after each change
2. **Use Find (Ctrl/Cmd + F)** - Quickly locate text in siteConfig.ts
3. **Keep backups** - Save a copy before major changes
4. **Update regularly** - Keep stats, team info, and content current

---

## ✅ Quick Checklist for Going Live

Before launching:

- [ ] Updated all placeholder text
- [ ] Replaced team photos with actual images
- [ ] Updated contact information
- [ ] Connected real social media links
- [ ] Tested on mobile and tablet
- [ ] Spell-checked all content
- [ ] Updated copyright year

---

**Questions?** The siteConfig.ts file has helpful comments throughout. Look for `//` or `/**` comments that explain each section.

Good luck with Rising Promise! 🌟
