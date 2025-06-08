# Public Assets Folder

Deze folder bevat alle statische bestanden voor de ChargeCars app.

## 📁 Folder Structuur

```
public/
├── images/          # Foto's, screenshots, banners
├── icons/           # App icons, kleine grafische elementen  
├── svg/             # SVG bestanden (logos, illustraties)
├── docs/            # PDF's, documenten voor download
├── favicon.ico      # Website favicon
└── robots.txt       # SEO robots bestand
```

## 🔗 Hoe te gebruiken in de app

### **In React componenten:**

```tsx
// Voor afbeeldingen
<img src="/images/logo.png" alt="ChargeCars Logo" />

// Voor SVG's
<img src="/svg/charging-icon.svg" alt="Charging Station" />

// Voor Next.js Image component
import Image from 'next/image'
<Image src="/images/hero-banner.jpg" width={800} height={400} />
```

### **In CSS/Tailwind:**

```css
/* Background afbeelding */
.hero {
  background-image: url('/images/hero-bg.jpg');
}
```

### **Voor downloads:**

```tsx
<a href="/docs/user-manual.pdf" download>
  Download User Manual
</a>
```

## 📝 Bestandsformaten

### **Aanbevolen formaten:**
- **Afbeeldingen**: `.png`, `.jpg`, `.webp`
- **Icons**: `.svg`, `.png` (meerdere maten)
- **Documenten**: `.pdf`, `.doc`
- **Data**: `.json`, `.xml`

### **Bestandsgrootte:**
- Houd afbeeldingen onder 1MB
- Gebruik WebP voor betere compressie
- Optimaliseer SVG's voor kleinere bestanden

## ⚡ Performance Tips

1. **Gebruik Next.js Image component** voor automatische optimalisatie
2. **WebP format** voor moderne browsers
3. **SVG's** voor icons en eenvoudige graphics
4. **Lazy loading** voor grote afbeeldingen

## 🚀 Production Ready

Alle bestanden in deze folder worden automatisch:
- ✅ Geserveerd door Next.js
- ✅ Gecached door de browser
- ✅ Geoptimaliseerd voor production
- ✅ Toegankelijk via `/filename.ext` URLs 