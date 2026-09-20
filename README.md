# Abschlussarbeiten-Portal · RH Köln

Statisches Portal für Bachelor-, Master-, Projekt- und Praxissemester-Themen an der Rheinischen Hochschule Köln.

**Nur Betreuer (Daniel & Kollege) können Themen eintragen, bearbeiten und löschen.**  
Studierende und Externe können alle Themen einsehen und filtern.

## Features

- **Vollständige webbasierte Verwaltung** (Anlegen, Bearbeiten, Löschen) – keine manuelle JSON-Bearbeitung mehr nötig
- Filter nach Art der Arbeit, Status, Studiengang, Unternehmen und Freitextsuche
- Detailansicht mit **Empfohlener Methodik**, Voraussetzungen, Kontakt usw.
- Unternehmen wird nur bei Projektarbeit & Praxissemester angezeigt und ist filterbar
- RH-Köln-Farbschema (Violett + Limettengrün)
- Änderungen werden lokal im Browser gespeichert (localStorage)
- Zum Veröffentlichen auf GitHub Pages: einmalig JSON exportieren und ersetzen

## Einrichtung auf GitHub Pages

1. Neues Repository anlegen (z. B. `abschlussarbeiten-portal`)
2. Alle Dateien hochladen:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `theses.json`
   - `README.md`
3. Unter **Settings → Pages** die Branch `main` und den Ordner `/ (root)` auswählen
4. Seite ist unter `https://<username>.github.io/abschlussarbeiten-portal/` erreichbar

## Neue Themen / Änderungen (webbasiert)

1. Auf der Website oben rechts **Admin** klicken
2. Passwort eingeben: `rh-koeln-2026` (bitte später in `app.js` ändern!)
3. Tab **Themen verwalten**:
   - Übersicht aller Themen
   - **Bearbeiten** oder **Löschen**
   - Button **+ Neues Thema**
4. Formular ausfüllen → **Thema speichern**
5. Änderungen sind sofort sichtbar (lokal im Browser)
6. Zum Veröffentlichen für alle Nutzer:
   - Button **JSON exportieren** → `theses.json` wird heruntergeladen
   - Diese Datei im GitHub-Repository ersetzen und committen
   - Nach dem Deploy sind die Änderungen für alle sichtbar

**Tipp:** Solange du und Daniel am selben Rechner/Browser arbeitet, bleiben die Daten über localStorage erhalten. Für die gemeinsame Nutzung reicht der einmalige Export + Commit.

## Passwort ändern

In der Datei `app.js` die Zeile

```js
const ADMIN_PASSWORD = "rh-koeln-2026";
```

durch ein eigenes Passwort ersetzen und neu committen.

## Datenstruktur (theses.json)

| Feld              | Beschreibung                              |
|-------------------|-------------------------------------------|
| titel             | Arbeitstitel                              |
| art               | Bachelorthesis / Masterthesis / Projektarbeit / Praxissemester |
| studiengang       | z. B. Mediendesign B.A.                   |
| kurzbeschreibung  | Abstract                                  |
| beschreibung      | Längere Beschreibung                      |
| **methodik**      | **Empfohlene Methodik** (Pflicht)         |
| betreuer          | Name der Betreuungsperson                 |
| kontakt           | E-Mail                                    |
| **unternehmen**   | Nur bei Praxis-/Projektarbeit             |
| ort               | Campus / Hybrid / Extern                  |
| beginn            | Zeitraum                                  |
| umfang            | Dauer / ECTS                              |
| voraussetzungen   | Fachliche Anforderungen                   |
| keywords          | Array von Schlagworten                    |
| sprache           | Deutsch / Englisch / beides               |
| verguetung        | unbezahlt / Aufwandsentschädigung …       |
| bewerbung         | Wie man sich bewirbt                      |
| status            | Verfügbar / In Bearbeitung / Vergeben / Abgeschlossen |

---

Viel Erfolg!
