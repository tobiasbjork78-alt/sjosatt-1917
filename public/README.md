# 📁 Public Folder - Statiska Filer

## 🖼️ Bildhantering

Lägg alla bilder i `public/` mappen. De blir tillgängliga från webbsidans rot.

### 📂 Struktur:
```
public/
├── images/           ← Alla bilder här
│   ├── avatars/     ← Användarbilder
│   ├── icons/       ← Ikoner och symboler
│   ├── backgrounds/ ← Bakgrunder
│   └── themes/      ← Tema-specifika bilder
├── favicon.ico      ← Webbsida-ikon
└── README.md        ← Den här filen
```

### 🔗 Användning i koden:

**I React/Next.js komponenter:**
```jsx
import Image from 'next/image'

// För bild i public/images/folke.jpg
<Image
  src="/images/folke.jpg"
  alt="Folke"
  width={200}
  height={200}
/>

// Eller vanlig img-tag
<img src="/images/folke.jpg" alt="Folke" />
```

**I CSS:**
```css
.background {
  background-image: url('/images/backgrounds/keyboard.jpg');
}
```

### ✅ Exempel på filplacering:

- **Folke-avatar**: `public/images/avatars/folke.png`
- **Tangentbord**: `public/images/backgrounds/keyboard.jpg`
- **Ikon**: `public/images/icons/typing.svg`

**Viktigt**: Börja alltid sökvägen med `/` (inte `public/`)!