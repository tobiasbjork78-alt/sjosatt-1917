# Sjösätt 1917 - Tangentbordsträningsspel 🎯

Ett modernt webbaserat tangentbordsträningsspel byggt med Next.js 15, React 19, och TypeScript.

## Features ✨

### Grundläggande träning
- **Progressiv träning**: Börjar med hemrader (ASDF JKL;) och bygger ut till fullständigt tangentbord
- **Real-time feedback**: WPM, noggrannhet, och combo-räknare
- **Visuellt tangentbord**: Färgkodade tangenter med finger-tilldelning
- **Intelligent level-progression**: Automatisk svårighetsökning baserad på prestanda

### Spellägen (7 stycken)
- 🎯 **Hemrader**: Grundläggande ASDF JKL; träning
- 📝 **Ord**: Blandade engelska och svenska ord
- 📖 **Meningar**: Svenska meningar och fraser
- ⌨️ **Kod**: JavaScript kod-snippets
- 🇸🇪 **Svenska**: Längre svenska texter
- 🔢 **Siffror**: Siffror och numeriska kombinationer
- ⚡ **Symboler**: Specialtecken och symboler

### Gamification
- **Prestationssystem**: 17 olika achievements i 4 kategorier
- **Poäng & XP**: Dynamiska poäng med combo-bonusar
- **Level-progression**: Matematisk progression baserad på XP
- **Streak-tracking**: Dagliga träningsserier
- **Kombo-system**: Bonuspoäng för konsekutiva korrekta tangenttryck

### Ljud & Tema
- **Ljud-feedback**: Web Audio API för tangentklick, fel, achievements
- **7 Teman**: Standard, Mörk, Ocean, Skog, Galax, Retro, Minimal
- **Visuella effekter**: Animationer och färgkodning

### Online funktioner
- **Supabase integration**: Progress-synkning mellan enheter
- **Leaderboards**: Tävla globalt i olika kategorier
- **Användarkonton**: Säker autentisering och datalagring
- **Offline-support**: Lokalt sparade framsteg med sync när online

### Multiplayer 👥
- **Real-time tävlingar**: Skapa eller gå med i familjerum
- **Live progress**: Se andras framsteg i realtid
- **Rum-system**: Anpassningsbara spelrum för 2-8 spelare
- **Same-text tävlingar**: Alla skriver samma text samtidigt

### Statistik & Analys
- **Detaljerad statistik**: Omfattande prestationsanalys över tid
- **Key-level analys**: Noggrannhet per individuell tangent
- **Problematiska tangenter**: Automatisk identifiering av svagheter
- **Rekommendationer**: AI-baserade förbättringstips

## Teknisk Stack 🛠️

- **Framework**: Next.js 15.5 med App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime för multiplayer
- **Ljud**: Web Audio API
- **Deployment**: Vercel

## Kom igång 🚀

### Förutsättningar
- Node.js 20+ (rekommenderat)
- npm eller yarn

### Installation
```bash
# Klona projektet
git clone [repository-url]
cd sjosatt-1917

# Installera dependencies
npm install

# Starta development server
npm run dev
```

### Supabase Setup
1. Skapa ett Supabase-projekt på [supabase.com](https://supabase.com)
2. Kopiera `.env.local` och fyll i dina Supabase-credentials
3. Kör SQL-schemat från `.env.local` i Supabase SQL Editor
4. Aktivera Realtime för `multiplayer_rooms` och `multiplayer_players` tabeller

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Användning 📖

### Grundläggande träning
1. Välj ett spelläge (börja med Hemrader)
2. Tryck tangenter enligt den färgkodade hjälpen
3. Fokusera på noggrannhet före hastighet
4. Träna regelbundet för bästa resultat

### Multiplayer
1. Logga in eller skapa konto
2. Klicka "Multiplayer" i menyn
3. Skapa ett rum eller gå med i ett befintligt
4. Vänta på fler spelare och starta spelet
5. Tävla i realtid!

## Databas Schema 🗄️

### Core Tables
- `profiles` - Användarinfo och framsteg
- `sessions` - Individuella spelsessioner
- `multiplayer_rooms` - Multiplayer spelrum
- `multiplayer_players` - Spelaredata för multiplayer

## Performance 🚄

- **Bundle size**: ~171 KB initial load
- **Runtime**: Client-side optimerat
- **Caching**: Aggressive caching av statisk content
- **Bildoptimering**: Next.js automatisk optimering

## Säkerhet 🔒

- **RLS**: Row Level Security i Supabase
- **Input validation**: Client & server-side validering
- **Rate limiting**: Naturlig begränsning via UI
- **No sensitive data**: Ingen känslig information lagras

## Bidra 🤝

Projektet välkomnar bidrag! Areas för förbättring:
- Fler språk och teckenuppsättningar
- Avancerad AI för personlig träning
- Mobil app (React Native)
- Enterprise features för skolor
- Advanced analytics dashboard

## License 📄

MIT License - Se LICENSE fil för detaljer.

## Support 💬

- **Issues**: GitHub Issues för bugrapporter
- **Features**: Feature requests via GitHub
- **Documentation**: Se `/docs` för utökad dokumentation

---

Byggt med ❤️ för alla som vill förbättra sin tangentbordsträning!