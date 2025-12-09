## Umfassender Testplan für Habix App

### 1. **Onboarding Flow**

#### Zu testende Komponenten:
- `welcome.page.ts/html`
- `LocalStorageService` (hasCompletedOnboarding)

#### Testschritte:
1. **Erster App-Start**
   - App komplett deinstallieren und neu installieren
   - Prüfen: Welcome-Seite wird angezeigt
   - Durch alle Slides swipen
   - "Get Started" Button klicken
   - Prüfen: Weiterleitung zu `/home`

2. **Onboarding Neustart**
   - In Settings → "Restart Onboarding" klicken
   - Prüfen: Weiterleitung zu `/welcome`
   - Prüfen: localStorage.hasCompletedOnboarding wurde entfernt

3. **Wiederholter App-Start**
   - App schließen und neu öffnen
   - Prüfen: Direkt zu `/home`, kein Onboarding

---

### 2. **Habit Management (Home Page)**

#### Testschritte:

**2.1 Habit erstellen:**
1. "+" Button klicken → Modal öffnet sich
2. Ohne Eingabe "Create" klicken → Fehler-Toast
3. Habit-Name eingeben (z.B. "Meditation")
4. Optional: Farbe auswählen
5. Optional: Icon auswählen
6. "Create" klicken
7. Prüfen:
   - Modal schließt sich
   - Neuer Habit erscheint in der Liste
   - Success-Toast wird angezeigt
   - Habit hat initial streak = 0

**2.2 Habit Check-in:**
1. Auf ungeprüften Habit klicken (grauer Circle)
2. Prüfen:
   - Circle wird grün mit Checkmark
   - Streak erhöht sich um 1
   - Confetti-Animation erscheint
   - Encouragement Notification nach 2 Sekunden (bei streak = 1)
3. Nochmal auf denselben Habit klicken
4. Prüfen:
   - Circle wird wieder grau
   - Streak bleibt gleich (kann nur einmal pro Tag gecheckt werden)

**2.3 Habit bearbeiten:**
1. Habit nach rechts swipen → Edit-Button erscheint
2. Edit-Button klicken → Modal öffnet sich mit vorausgefüllten Daten
3. Name ändern
4. Farbe ändern
5. Icon ändern
6. "Update" klicken
7. Prüfen: Änderungen werden übernommen

**2.4 Habit löschen:**
1. Habit nach rechts swipen → Delete-Button erscheint
2. Delete-Button klicken
3. Prüfen: Habit verschwindet aus der Liste

**2.5 Pull-to-Refresh:**
1. Von oben nach unten ziehen
2. Prüfen: Liste wird aktualisiert

**2.6 Leerer Zustand:**
1. Alle Habits löschen
2. Prüfen: "No habits yet" Nachricht wird angezeigt

---

### 3. **Statistics Page**

#### Testschritte:

**3.1 Statistik-Anzeige:**
1. Mehrere Habits mit unterschiedlichen Streaks erstellen
2. Zur Statistics-Seite wechseln
3. Prüfen:
   - Total Habits korrekt
   - Active Streaks korrekt
   - Best Streak zeigt höchsten Wert
   - Completion Rate wird angezeigt

**3.2 Habit-Liste:**
1. Prüfen: Alle Habits werden angezeigt
2. Prüfen: Streak-Zähler ist korrekt
3. Prüfen: Progress-Bar zeigt korrekten Wert
4. Habit anklicken → Detail-Modal öffnet sich

**3.3 Habit-Detail Modal:**
1. Modal zeigt:
   - Habit-Name
   - Icon und Farbe
   - Current Streak
   - Best Streak
   - Total Check-ins
   - Start Date
   - Days Active
   - Success Rate
2. Calendar zeigt checked Tage grün
3. "Close" Button schließt Modal

**3.4 Pull-to-Refresh:**
1. Von oben nach unten ziehen
2. Prüfen: Daten werden aktualisiert

**3.5 Leerer Zustand:**
1. Alle Habits löschen
2. Prüfen: "No habits tracked yet" Nachricht

---

### 4. **Settings Page**

#### Testschritte:

**4.1 Theme-Wechsel:**
1. "Light" auswählen
2. Prüfen: App wird hell
3. "Dark" auswählen
4. Prüfen: App wird dunkel
5. "System" auswählen
6. Prüfen: App folgt System-Theme
7. App neu starten
8. Prüfen: Theme-Einstellung bleibt erhalten

**4.2 Notifications Toggle:**
1. Toggle ausschalten
2. Prüfen: Einstellung wird in Preferences gespeichert
3. Toggle einschalten
4. Test Notification klicken
5. Prüfen:
   - Permission-Dialog erscheint (beim ersten Mal)
   - Notification erscheint nach kurzer Zeit
6. App neu starten
7. Prüfen: Toggle-Status bleibt erhalten

**4.3 About-Informationen:**
1. Prüfen: App Name wird angezeigt
2. Prüfen: Version wird angezeigt

**4.4 Restart Onboarding:**
1. "Restart Onboarding" klicken
2. Prüfen: Weiterleitung zu Welcome-Seite

**4.5 Pull-to-Refresh:**
1. Von oben nach unten ziehen
2. Prüfen: Settings werden aktualisiert

---

### 5. **Persistence & Data Integrity**

#### Testschritte:

**5.1 Daten-Persistenz:**
1. 3 Habits erstellen
2. Check-ins für verschiedene Tage durchführen
3. App komplett schließen (Task Manager)
4. App neu öffnen
5. Prüfen: Alle Habits und Check-ins sind da

**5.2 Storage-Konsistenz:**
1. In Chrome DevTools → Application → Preferences prüfen:
   - `habits` Key existiert
   - `habits_HABITID_checks` Keys existieren
   - `themePreference` existiert
   - `notificationsEnabled` existiert

**5.3 Streak-Berechnung:**
1. Habit erstellen
2. Check-in machen (Tag 1)
3. Gerätedatum auf morgen stellen
4. Check-in machen (Tag 2)
5. Prüfen: Streak = 2
6. Gerätedatum auf übermorgen stellen
7. KEINEN Check-in machen
8. Gerätedatum auf +3 Tage stellen
9. Check-in machen
10. Prüfen: Streak = 1 (wurde zurückgesetzt)

---

### 6. **Notifications**

#### Testschritte:

**6.1 Test Notification:**
1. Settings → Test Notification klicken
2. Prüfen: Notification erscheint
3. Notification antippen
4. Prüfen: App öffnet sich

**6.2 Daily Reminders:**
1. Habit mit Reminder-Zeit erstellen (z.B. in 2 Minuten)
2. 2 Minuten warten
3. Prüfen: Reminder-Notification erscheint
4. Notification öffnen
5. Prüfen: App öffnet sich

**6.3 Encouragement Notifications:**
1. Neuen Habit erstellen
2. Ersten Check-in machen
3. Nach ~2 Sekunden prüfen: Encouragement Notification

**6.4 Notifications deaktiviert:**
1. Settings → Notifications Toggle ausschalten
2. Test Notification klicken
3. Prüfen: Keine Notification erscheint

---

### 7. **UI/UX Testing**

#### Testschritte:

**7.1 Animationen:**
1. Habit Check-in → Confetti-Animation
2. Swipe-Gesten → Smooth Sliding
3. Modal-Öffnen/Schließen → Smooth Transitions

**7.2 Responsive Design:**
1. App in verschiedenen Orientierungen testen:
   - Portrait
   - Landscape
2. Prüfen: Alle Elemente sind sichtbar und bedienbar

**7.3 Touch-Gesten:**
1. Swipe nach rechts → Edit/Delete Buttons
2. Pull-to-Refresh funktioniert
3. Modal-Swipe-Down zum Schließen

**7.4 Loading States:**
1. Prüfen: Keine merkbaren Verzögerungen
2. Pull-to-Refresh zeigt Spinner

---

### 8. **Edge Cases & Error Handling**

#### Testschritte:

**8.1 Leere Eingaben:**
1. Habit ohne Namen erstellen → Fehler
2. Habit mit nur Leerzeichen → Fehler

**8.2 Maximale Daten:**
1. 50+ Habits erstellen
2. Prüfen: Performance bleibt gut
3. Prüfen: Scroll funktioniert

**8.3 Datum-Manipulationen:**
1. System-Datum in die Zukunft stellen
2. Prüfen: App funktioniert normal
3. System-Datum in die Vergangenheit stellen
4. Prüfen: App funktioniert normal

**8.4 Storage-Limits:**
1. Viele Habits mit vielen Check-ins
2. Prüfen: Keine Fehler bei voller Storage

---

### 9. **Platform-spezifische Tests**

#### Android:
1. Back-Button verhält sich korrekt
2. App-Switching funktioniert
3. Notifications erscheinen in Notification Drawer
4. Dark Mode folgt System-Einstellung
5. Permissions werden korrekt angefragt

#### iOS (falls geplant):
1. Safe Area wird respektiert
2. Swipe-Back-Geste funktioniert
3. Haptic Feedback
4. Dark Mode folgt System-Einstellung

---

### 10. **Performance Testing**

#### Testschritte:
1. **App-Start-Zeit**: < 2 Sekunden
2. **Habit-Check-in**: Sofortige Reaktion
3. **List-Rendering**: Mit 50+ Habits smooth
4. **Animation-Performance**: 60 FPS
5. **Memory-Leaks**: Keine Crashes bei längerer Nutzung

---

## Zusammenfassung der kritischen Funktionen:

✅ **MUST-WORK:**
- Habits erstellen/bearbeiten/löschen
- Check-ins durchführen
- Streak-Berechnung korrekt
- Daten-Persistenz
- Theme-Wechsel
- Notifications funktionieren

⚠️ **NICE-TO-HAVE:**
- Animationen smooth
- Pull-to-Refresh
- Statistics-Details
- Calendar-View
