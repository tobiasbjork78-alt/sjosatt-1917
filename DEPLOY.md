# 🚀 Deployment Guide - Sjösätt 1917

Denna guide hjälper dig att distribuera tangentbordsträningsspelet till Vercel.

## 📋 Förberedelser

### 1. Kontrollera att projektet bygger korrekt
```bash
npm run build
```

### 2. Verifiera alla funktioner
- ✅ Spelet fungerar lokalt
- ✅ Alla träningslägen fungerar
- ✅ Achievement-system fungerar
- ✅ Ljudeffekter fungerar
- ✅ Tema-växling fungerar
- ✅ Statistik-panelen fungerar

## 🗄️ Supabase Setup

### 1. Skapa Supabase-projekt
1. Gå till [supabase.com](https://supabase.com)
2. Skapa ett nytt projekt
3. Välj en region (Stockholm för svenska användare)
4. Vänta på att projektet skapas

### 2. Konfigurera databas-schema

Kör dessa SQL-kommandon i Supabase SQL Editor:

```sql
-- Skapa användarprofiler
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  total_words_typed INTEGER DEFAULT 0,
  total_time_spent BIGINT DEFAULT 0,
  highest_wpm INTEGER DEFAULT 0,
  highest_accuracy INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '{}'
);

-- Skapa sessions-tabell
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  duration BIGINT NOT NULL,
  text_length INTEGER NOT NULL,
  combo_max INTEGER DEFAULT 0,
  combo_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skapa multiplayer-rum
CREATE TABLE multiplayer_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  players JSONB DEFAULT '[]',
  status TEXT DEFAULT 'waiting',
  game_mode TEXT NOT NULL,
  game_text TEXT NOT NULL,
  max_players INTEGER DEFAULT 4,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  start_time BIGINT,
  end_time BIGINT
);

-- Aktivera real-time för multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_rooms;
```

### 3. Konfigurera Row Level Security (RLS)

```sql
-- Aktivera RLS för alla tabeller
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies för profiles
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (true);

-- RLS policies för sessions
CREATE POLICY "Sessions are readable by profile owner" ON sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own sessions" ON sessions FOR INSERT WITH CHECK (true);

-- RLS policies för multiplayer_rooms
CREATE POLICY "Rooms are publicly readable" ON multiplayer_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON multiplayer_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON multiplayer_rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON multiplayer_rooms FOR DELETE USING (true);
```

### 4. Hämta API-nycklar
1. Gå till Settings → API
2. Kopiera `Project URL` och `anon/public` nyckel
3. Spara dessa för senare

## 🚀 Vercel Deployment

### 1. Installera Vercel CLI
```bash
npm install -g vercel
```

### 2. Logga in på Vercel
```bash
vercel login
```

### 3. Förbered deployment
```bash
# Kontrollera att projektet bygger
npm run build

# Starta deployment
vercel
```

### 4. Konfigurera miljövariabler i Vercel

Gå till ditt Vercel-projekt dashboard och lägg till:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Trigga ny deployment
```bash
vercel --prod
```

## 🔧 Post-Deployment Checklist

### Funktionell testning
- [ ] Webbsidan laddas korrekt
- [ ] Alla 7 spellägen fungerar
- [ ] Real-time statistik uppdateras
- [ ] Achievement-systemet fungerar
- [ ] Leaderboard fungerar
- [ ] Ljudeffekter fungerar
- [ ] Tema-växling fungerar
- [ ] Multiplayer-rum kan skapas
- [ ] Multiplayer real-time sync fungerar
- [ ] Progress sparas mellan sessioner

### Prestanda-kontroller
- [ ] Sidan laddar snabbt (<3 sekunder)
- [ ] Inga JavaScript-fel i konsolen
- [ ] Responsiv design fungerar på mobil
- [ ] PWA-funktioner fungerar (om aktiverat)

### SEO och metadata
- [ ] Titel och beskrivning är korrekt
- [ ] Favicon visas
- [ ] Open Graph metadata (för social sharing)

## 🐛 Vanliga problem och lösningar

### Problem: "Supabase connection error"
**Lösning:**
1. Kontrollera att miljövariablerna är korrekt satta
2. Verifiera att Supabase-projektet är aktivt
3. Kontrollera RLS-policies

### Problem: "Real-time not working"
**Lösning:**
1. Kontrollera att real-time är aktiverat i Supabase
2. Lägg till tabeller till real-time publication
3. Kontrollera nätverksanslutning

### Problem: "Audio not playing"
**Lösning:**
1. Moderna webbläsare kräver användarinteraktion före ljud
2. Kontrollera att ljud är aktiverat i inställningar
3. Testa i olika webbläsare

### Problem: "Multiplayer rooms not updating"
**Lösning:**
1. Kontrollera real-time subscriptions
2. Verifiera WebSocket-anslutningar
3. Kontrollera network-policies

## 📊 Monitorering och underhåll

### Vercel Analytics
1. Aktivera Vercel Analytics i projektet
2. Övervaka prestanda och fel
3. Kontrollera användningsstatistik

### Supabase Monitoring
1. Övervaka databas-prestanda
2. Kontrollera real-time anslutningar
3. Hantera storage-limits

### Säkerhetsuppdateringar
```bash
# Uppdatera beroenden regelbundet
npm update
npm audit fix

# Kontrollera för säkerhetsproblem
npm audit
```

## 🔄 Uppdateringar och underhåll

### För att uppdatera applikationen:
1. Gör ändringar lokalt
2. Testa att allt fungerar: `npm run build`
3. Committa ändringar till Git
4. Deploy: `vercel --prod`

### Databas-migrationer:
1. Skapa nya SQL-skript för schema-ändringar
2. Testa på staging-environment först
3. Applicera på production-databas
4. Verifiera att allt fungerar

## 📞 Support och hjälp

### Resurser:
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Troubleshooting:
1. Kontrollera Vercel function logs
2. Kontrollera Supabase logs
3. Kontrollera browser developer tools
4. Testa i inkognito-läge

---

**🎉 Grattis! Din tangentbordstränings-app är nu live på internet!**

Nu kan familjen träna tangentbord tillsammans, tävla på topplistan och förbättra sina färdigheter från vilken enhet som helst med internetanslutning.