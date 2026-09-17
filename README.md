# Abschlussarbeiten-Portal · RH Köln

Statisches Portal für Bachelor-, Master-, Projekt- und Praxissemester-Themen an der Rheinischen Hochschule Köln.

**Nur Betreuer (Daniel & Kollege) können Themen eintragen.**  
Studierende und Externe können alle Themen einsehen und filtern.

## Features

- Filter nach **Art der Arbeit**, Status, Studiengang, Unternehmen und Freitextsuche
- Detaillierte Ansicht mit **Empfohlener Methodik**, Voraussetzungen, Kontakt usw.
- Unternehmen wird nur bei Projektarbeit & Praxissemester angezeigt und ist filterbar
- RH-Köln-Farbschema (Violett + Limettengrün)
- Einfacher Admin-Bereich (Passwortgeschützt)
- Komplett statisch → ideal für **GitHub Pages**

## Einrichtung auf GitHub Pages

1. Neues Repository anlegen (z. B. `abschlussarbeiten-portal`)
2. Alle Dateien aus diesem Ordner hochladen:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `theses.json`
   - `README.md`
3. Unter **Settings → Pages** die Branch `main` (oder `master`) und den Ordner `/ (root)` auswählen
4. Nach 1–2 Minuten ist die Seite unter `https://<username>.github.io/abschlussarbeiten-portal/` erreichbar

## Neue Themen eintragen

1. Auf der Website oben rechts auf **Admin** klicken
2. Passwort eingeben: `rh-koeln-2026` (bitte später in `app.js` ändern!)
3. Formular ausfüllen → **Thema speichern & JSON herunterladen**
4. Die heruntergeladene `theses.json` im Repository ersetzen und committen
5. Nach dem Commit ist das neue Thema live (GitHub Pages aktualisiert sich meist innerhalb von 1 Minute)

Alternativ kannst du die `theses.json` auch direkt in GitHub bearbeiten.

## Passwort ändern

In der Datei `app.js` die Zeile

```js
const ADMIN_PASSWORD = "rh-koeln-2026";
```

durch ein eigenes Passwort ersetzen und neu committen.

## Datenstruktur (theses.json)

Jedes Thema enthält u. a.:

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

Viel Erfolg beim Einsatz!
