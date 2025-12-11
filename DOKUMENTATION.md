# HABIT TRACKER
**Nikola Hadzic**  
**4. DEZEMBER 2025**  
**23-223-E**  
**ICT-Modul 335 - Mobile-Applikation**

---

## Inhaltsverzeichnis
- [Projektbeschreibung](#projektbeschreibung)
- [Ziel der Applikation](#ziel-der-applikation)
- [Umgesetzte Funktionalitäten](#umgesetzte-funktionalitäten)
- [Eingesetzte Geräteschnittstellen](#eingesetzte-geräteschnittstellen)
- [Technologien](#technologien)
- [Ansichten](#ansichten)
- [Datenbankmodell](#datenbankmodell)
- [User Stories](#user-stories)

---

## Projektbeschreibung
Die Applikation ist ein Habit Tracker, entwickelt mit Ionic Angular. Nutzende können persönliche Gewohnheiten erstellen, täglich abhaken und deren Fortschritt analysieren. Die App hilft durch eine klare Darstellung und intuitive Bedienung, Routinen aufzubauen und langfristig zu halten. Die Anwendung wird als Android-App und PWA bereitgestellt.

---

## Ziel der Applikation
Ziel ist eine funktionale, übersichtliche und benutzerfreundliche Mobile-App, die das Erstellen und Verfolgen von Gewohnheiten unterstützt. Sie bietet grundlegende Tracking-Funktionen, Statistiken und Erinnerungen sowie die Integration relevanter Gerätefunktionen.

---

## Umgesetzte Funktionalitäten
- ✅ CRUD-Funktionen für Habits über Supabase
- ✅ Tagesübersicht aller Habits mit Abhakfunktion
- ✅ Statistikseite (Streaks, Wochenübersicht, Monatsübersicht)
- ✅ Erinnerungen pro Habit (Local Notifications)
- ✅ Offline-Nutzung durch lokalen Speicher (Capacitor Preferences)
- ✅ Manuell schaltbarer Dark-Mode
- ✅ Individuelles App-Design, Icon und Splashscreen
- ✅ Welcome-Screen und Onboarding für neue Nutzer
- ✅ Automatische Synchronisation zwischen lokalem Speicher und Supabase

---

## Eingesetzte Geräteschnittstellen
Die folgenden **5 Geräteschnittstellen** wurden implementiert:

1. **Benachrichtigungen** (`@capacitor/local-notifications`)
   - Tägliche Erinnerungen für einzelne Habits
   - Zeitbasierte Benachrichtigungen

2. **Lokale Datenspeicherung** (`@capacitor/preferences`)
   - Offline-Speicherung aller Habits und Completions
   - Persistente Einstellungen (Theme, Onboarding-Status)

3. **Netzwerkstatus** (`@capacitor/network`)
   - Erkennung von Online-/Offline-Zuständen
   - Automatische Synchronisation bei Verbindungsänderung

4. **Splash Screen** (`@capacitor/splash-screen`)
   - Professioneller Ladebildschirm beim App-Start
   - Angepasstes Design für Light- und Dark-Mode

5. **Haptisches Feedback & Tastatur** (`@capacitor/haptics`, `@capacitor/keyboard`)
   - Verbessertes Nutzererlebnis durch Vibrations-Feedback
   - Intelligente Tastatursteuerung

---

## Technologien
- **Ionic Angular** (v8.0.0)
- **Angular** (v20.0.0) - Komponenten, Services, Routing
- **Capacitor** (v7.4.4) mit folgenden Plugins:
  - Local Notifications
  - Preferences (Storage)
  - Network
  - Splash Screen
  - Haptics
  - Keyboard
  - Status Bar
- **Supabase** (`@supabase/supabase-js`) als Backend für Datenhaltung
- **RxJS** für reaktive Programmierung
- **Android-Build** mit Capacitor

---

## Ansichten
Die App verfasst über **6 Hauptansichten**:

### 1. Welcome-Seite
- Willkommensbildschirm mit Einstieg in die App
- Leitet neue Nutzer zum Onboarding weiter

### 2. Onboarding
- Einführung für neue Nutzer
- Erklärung der Hauptfunktionen

### 3. Tagesübersicht (Today Tab)
- Liste aller aktiven Habits
- Checkbox zum Abhaken
- Streak-Anzeige pro Habit
- Schnellzugriff auf Habit-Details

### 4. Habit-Detailseite
- Erstellen neuer Habits
- Bearbeiten bestehender Habits
- Konfiguration von:
  - Titel und Beschreibung
  - Icon und Farbe
  - Erinnerungszeit
  - Aktivierungsstatus

### 5. Statistikseite (Statistics Tab)
- Übersicht aller Habits mit detaillierten Statistiken
- Current Streak Anzeige pro Habit
- Longest Streak Anzeige pro Habit
- Total Completions pro Habit
- Wochenübersicht der letzten 12 Wochen
- Monatsübersicht der letzten 6 Monate mit Completion-Rate
- Gesamtstatistik (aktive Streaks, längster Streak, etc.)
- Completion-Rate Visualisierung

### 6. Einstellungen (Settings Tab)
- Dark-Mode Umschaltung (Light / Dark / System)
- Benachrichtigungseinstellungen
- Test-Benachrichtigung
- App-Informationen

---

## Datenbankmodell

### Tabelle: `habits`
Speichert alle Gewohnheiten der Nutzer.

| Feldname | Datentyp | Beschreibung |
|----------|----------|--------------|
| `id` | UUID | Primary Key, automatisch generiert |
| `title` | VARCHAR(255) | Titel der Gewohnheit (Pflichtfeld) |
| `description` | TEXT | Detaillierte Beschreibung |
| `icon` | VARCHAR(50) | Ionicons Icon-Name |
| `color` | VARCHAR(7) | Hex-Farbcode (z.B. #667eea) |
| `reminder_time` | TIME | Zeitpunkt der Erinnerung |
| `reminder_enabled` | BOOLEAN | Ob Erinnerungen aktiviert sind |
| `is_active` | BOOLEAN | Ob Habit aktiv ist |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |
| `updated_at` | TIMESTAMPTZ | Letzte Aktualisierung |
| `streak_count` | INTEGER | Aktuelle Streak-Anzahl |

**Indizes:**
- `idx_habits_active` auf `is_active`
- `idx_habits_created_at` auf `created_at`

---

### Tabelle: `habit_completions`
Speichert alle Abhakungen (Completions) von Habits.

| Feldname | Datentyp | Beschreibung |
|----------|----------|--------------|
| `id` | UUID | Primary Key, automatisch generiert |
| `habit_id` | UUID | Foreign Key zu `habits(id)` |
| `completed_at` | TIMESTAMPTZ | Zeitpunkt der Abhakung |
| `notes` | TEXT | Optionale Notizen |

**Indizes:**
- `idx_completions_habit_id` auf `habit_id`
- `idx_completions_completed_at` auf `completed_at`

**Beziehungen:**
- 1:n Beziehung - Ein Habit kann viele Completions haben
- CASCADE DELETE - Beim Löschen eines Habits werden alle zugehörigen Completions gelöscht

---

### Datenbankdiagramm

```
┌─────────────────────────┐
│       habits            │
├─────────────────────────┤
│ id (PK)                 │
│ title                   │
│ description             │
│ icon                    │
│ color                   │
│ reminder_time           │
│ reminder_enabled        │
│ is_active               │
│ created_at              │
│ updated_at              │
│ streak_count            │
└───────────┬─────────────┘
            │
            │ 1:n
            │
┌───────────┴─────────────┐
│  habit_completions      │
├─────────────────────────┤
│ id (PK)                 │
│ habit_id (FK)           │
│ completed_at            │
│ notes                   │
└─────────────────────────┘
```

---

## User Stories

### 1. Habits erfassen
**Als** Nutzer  
**möchte ich** neue Habits mit Titel, Icon, Farbe und Beschreibung erfassen können,  
**damit** ich meine Routinen übersichtlich und individuell verwalten kann.

**Akzeptanzkriterien:**
- Formular zum Erstellen neuer Habits
- Auswahl von Icon und Farbe
- Speicherung in Supabase und lokal

---

### 2. Habits täglich abhaken
**Als** Nutzer  
**möchte ich** meine Habits täglich abhaken können,  
**damit** ich meinen Fortschritt festhalte und meine Streaks aufbaue.

**Akzeptanzkriterien:**
- Checkbox in der Tagesübersicht
- Visuelle Bestätigung beim Abhaken
- Aktualisierung der Streak-Anzeige

---

### 3. Streaks und Statistiken einsehen
**Als** Nutzer  
**möchte ich** Streaks, Wochen- und Monatsstatistiken einsehen können,  
**damit** ich meine Entwicklung nachvollziehen und motiviert bleiben kann.

**Akzeptanzkriterien:**
- Statistikseite mit visueller Darstellung
- Anzeige von aktuellen Streaks
- Wochen- und Monatsübersicht

---

### 4. Erinnerungen erhalten
**Als** Nutzer  
**möchte ich** zu definierten Zeiten Erinnerungen zu einzelnen Habits erhalten,  
**damit** ich sie nicht vergesse und konsistent bleibe.

**Akzeptanzkriterien:**
- Zeitauswahl für Erinnerungen
- Local Notifications zur eingestellten Zeit
- Aktivierung/Deaktivierung pro Habit

---

### 5. Offline-Nutzung
**Als** Nutzer  
**möchte ich** die App offline nutzen können,  
**damit** ich unabhängig vom Internet meine Habits pflegen und später synchronisieren kann.

**Akzeptanzkriterien:**
- Lokale Speicherung mit Capacitor Preferences
- Automatische Synchronisation bei Verbindung
- Funktionsfähigkeit ohne Internetverbindung
