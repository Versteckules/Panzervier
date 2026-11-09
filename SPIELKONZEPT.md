# SPIELKONZEPT // PANZERKNACKER IV: PROJEKT TASCHANGO1
## "Der Ausbruch" – D4/D5 High-End Geocaching Web-Heist

**Version:** 4.2 (Final Release Candidate)  
**Stand:** 05. November 2026  
**Ziel-Plattformen:** Mobile (iOS/Android), Tablet (iPad/Android) & Desktop  
**Spieldauer:** ca. 30–45 Minuten  
**Zielkoordinaten (verschlüsselt):** `N 50° 09.502'  E 012° 07.467'`  

---

## 1. STORYLINE & CHARAKTER-KONZEPT

### 1.1 Die Rollenverteilung
* **Mastermind Taschango1 (`tschango.jpg`):**  
  Der geniale Kopf und Drahtzieher der Operation. Sitzt in der abhörsicheren Leitstelle und koordiniert den Coup. Präsentiert auf dem Cyber-Dossier-Portrait mit neon-amberfarbenem Backlight und Head-Up-Display. Kommuniziert über verschlüsselte Funksprüche im urigen fränkischen Dialekt.
* **Agent Versteckules (`Avatar.jpg`):**  
  Der erfahrene Feld-Agent (Agent 01). Hat das Hochsicherheits-Bunkerareal infiltriert und steht vor Ort vor den 10 mechanischen, optischen und elektronischen Sicherheitsschleusen. Präsentiert mit neon-cyanfarbenem Cyber-Ausweis.

### 1.2 Die Funkübertragung & Akustik
* Jedes der 10 Level besitzt ein vergilbtes Missions-Dossier im Stil klassischer Geheimdienst-Akten ("Authentic Espionage PADD").
* **Fränkische Sprachausgabe:**  
  Über den Button `[ 📻 FUNKSPRUCH ABHÖREN (FRÄNKISCH) ]` wird eine echte Audio-Übertragung von Taschango1 abgespielt.
* **Funkgeräte-Effekt (Walkie-Talkie FX):**  
  Die MP3s (`audio/funk_1.mp3` bis `funk_10.mp3`) werden live über einen Web Audio API Bandpass-Filter (1450 Hz Telefon-/Sprechfunkband) geleitet, inklusive echtem Squelch-Rauschen und Roger-Piepen zu Beginn und Ende der Nachricht.
* **Austauschbarkeit:**  
  Die 10 MP3-Dateien können vom Cache-Owner jederzeit 1:1 durch eigene Sprachaufnahmen im Ordner `audio/` ersetzt werden.
* **Dossier-Funksiegel:**  
  Am Fuß jedes Dossiers ist ein gestempeltes Funksiegel mit den Silhouetten beider Agenten eingebunden:  
  `[ Taschango1 ]` – **ABHÖRSICHERER FUNKSPRUCH // TASCHANGO1 ➔ VERSTECKULES** – `[ Versteckules ]`

---

## 2. SYSTEMARCHITEKTUR & DATEISTRUKTUR

```
Panzerkvier-main/
├── index.html                  # Single-Page-Applikation mit 10 Level-Sektoren + Boot- & Victory-Screen
├── README.md                   # Cache-Owner Dokumentation & Walkthrough
├── SPIELKONZEPT.md             # Dieses vollständige Systemkonzept
├── Avatar.jpg                  # Cyber-Badge von Agent Versteckules (mit MIB-Sonnenbrille)
├── tschango.jpg                # Cyber-Badge von Mastermind Taschango1 (mit MIB-Sonnenbrille)
├── Avatar_stamp.png            # Transparenter schwarzer Ink-Stempel (Versteckules)
├── tschango_stamp.png          # Transparenter schwarzer Ink-Stempel (Taschango1)
├── css/
│   └── style.css               # Skeuomorphes Cyber-Vault Styling, HiDPI, responsive Media Queries
├── js/
│   ├── app.js                  # Haupt-Controller, Screen-Management, Statusbar, Event-Dispatcher
│   ├── puzzles.js              # Interaktive Puzzle-Engines (Canvas-Renderer, Physik, Touch-Drag)
│   ├── audio.js                # Synthesizer für mechanische Sounds & Funk-Audio-Player mit Web Audio FX
│   ├── crypto.js               # SHA-256 Kette & XOR-Entschlüsselung der finalen Koordinaten
│   └── storage.js              # Hybride Speicherung (Cookies + LocalStorage) mit Auto-Migration
└── audio/
    ├── funk_1.mp3 bis funk_10.mp3 # Fränkische Audio-Dateien für alle 10 Sektoren
```

---

## 3. DETAILLIERTES LEVEL-KONZEPT (ALLE 10 SEKTOREN)

Jedes Rätsel ist ein Unikat (keine Duplikate aus Teil 1–3), folgt den Grundsätzen für D4/D5-Geocaches und ist zu 100% mathematisch und physikalisch lösbar.

| Sektor | Name | Genre / Mechanik | Mathematischer Kern & Interaktion |
|:---:|:---|:---|:---|
| **01** | **Prisma-Spektrallabor** | Optik & Brechungsindex | Weißer Laser wird im dispersiven Prisma gebrochen. Der Spieler dreht das Prisma und verschiebt die Linsen $L_1$ (Rot) und $L_2$ (Blau) per Touch, sodass Rot auf Sensor $\alpha$, Grün waagerecht auf $\beta$ und Blau auf $\gamma$ trifft. |
| **02** | **Laser-Knoten-Entwirrung** | Graphentheorie (Planar Graph) | 7 Quanten-Knoten (6 im Ring + 1 Zentralknoten) mit 12 Laserstrahlen. Rote Strahlen schneiden sich. Durch freies Verschieben der Knoten mit dem Finger müssen alle Kreuzungen auf 0 reduziert werden, bis alle Linien grün aufleuchten. |
| **03** | **Körperschall-Tresor** | Akustische Körperschall-Resonanz | Ein gerändeltes Zahlenrad (00–99) wird gedreht. Ein CRT-Oszilloskop zeigt Vibrationen der Zuhaltungen. Bei maximaler Amplitude muss die Scheibe arretiert werden. **Ziel-Folge: 38 ➔ 74 ➔ 19**. |
| **04** | **Platinen-Schaltkreis** | Rotierendes Leitungsnetz (Mil-Spec FR-4) | 4×4 Platine mit Leiterbahnen (Geraden, Kurven, T-Stücke). Durch Antippen rotieren die Kacheln um 90°, bis ein durchgehender Goldleiter von links oben (24V In) nach rechts unten (Relais-Gate) leuchtet. |
| **05** | **Frequenz-Spektrogramm** | Digitale Signalverarbeitung | Stark verrauschtes Transceiver-Signal. Drei analoge Schieberegler müssen justiert werden: **HPF = 850 Hz** (unterdrückt Rumpeln), **LPF = 4200 Hz** (unterdrückt Zischen), **Notch = 500 Hz** (beseitigt Netzbrummen). Das Spektrum offenbart den Code **`7429`**. |
| **06** | **Druckventil-Hydraulik** | Lineare Gleichungssysteme (Kreuzstrom) | 4 gekoppelte Kammern (Basis: $[3.5, 2.5, 5.0, 3.0]$ Bar). 4 Ventile mit Kreuzkopplung. Bewiesene **einzige Lösung:** $V_0=1, V_1=1, V_2=0, V_3=1$ (Ventil I, II und IV aktiv). Alle 4 Manometer balancieren exakt bei **3.5 Bar**. |
| **07** | **Laser-Lichtschranken-Parcours** | Optische Reflexion & Laser-Bypass | Der Bunkerkorridor ist mit roten Laser-Lichtschranken (Sensoren A1, A2, A3, A4) abgeriegelt. Der Spieler tippt auf 4 montierte Prismenspiegel, um sie jeweils um 45° zu drehen. **Eindeutige Lösung:** $\alpha=45^\circ, \beta=45^\circ, \gamma=135^\circ, \delta=135^\circ$. Der Strahl umgeht alle Alarmsensoren und speist den grünen Bypass-Kollektor ein! |
| **08** | **Konzentrische Krypto-Walze** | Caesar-/Krypto-Scheibe | Drei konzentrische Messingringe mit Schleifkontakten. Müssen per Kreisgeste direkt auf die rote Rubin-Markierung ausgerichtet werden: **Außen: C** (3. Buchstabe), **Mitte: 2** (kleinste Primzahl), **Innen: VII** (römische 7). |
| **09** | **Epizyklisches Planetengetriebe** | Zahnrad-Kinematik | Panzertor mit Sonnenrad ($Z_s=18$), Hohlrad ($Z_r=42$) und Planeten. Übersetzungsverhältnis $i = 1 + (Z_r/Z_s)$. Sonnenrad muss auf **`20` Zähne** eingestellt und per Kupplungsknopf synchronisiert werden. |
| **10** | **Flucht-Vektorplotter** | Trilateration (Radar-Display) | Drei militärische Funkbaken senden Distanzkreise. Das taktische Fadenkreuz wird per Finger/Maus exakt auf den gemeinsamen Schnittpunkt aller drei Kreise geführt. Bei grünem Einrasten wird die Fluchtzündung aktiviert. |

---

## 4. KRYPTOGRAFIE & KOORDINATENSCHUTZ

### 4.1 Kein Klartext im Sourcecode
Die finalen Geocaching-Koordinaten existieren **weder als String noch als Base64-Klartext** im JavaScript-Code:
```
N 50° 09.502'  E 012° 07.467'
```
Sie sind mit einem 256-Bit SHA-256 Hash verschlüsselt, der sich aus der Kette aller 10 Token zusammensetzt:
```javascript
const REQUIRED_TOKENS = [
    'L1_PRISM', 'L2_UNTANGLE', 'L3_STETHOSCOPE', 'L4_CIRCUIT',
    'L5_SPECTRUM', 'L6_HYDRAULIC', 'L7_SHADOW', 'L8_ROTORS',
    'L9_PLANETARY', 'L10_VECTOR'
];
```

### 4.2 Entschlüsselungs-Algorithmus (`js/crypto.js`)
1. Erst wenn alle 10 Token im Speicher vorliegen, generiert `GameCrypto` den Schlüssel-String:
   $$K = \text{"L1\_PRISM:L2\_UNTANGLE:...:L10\_VECTOR"}$$
2. Aus $K$ wird der SHA-256 Hash berechnet (mittels `window.crypto.subtle` oder Bit-Shift Fallback).
3. Der Hash dient als XOR-Keystream gegen den Base64-Chiffretext `WvUYqyX8NHRDOrU0Rn4oMnPPNR6a5JpM7yCy/uOvOA==`.
4. Erst im Siegesbildschirm wird das Klartext-Ergebnis gerendert und ein Ein-Klick-Button **"KOORDINATEN KOPIEREN 📋"** bereitgestellt.

---

## 5. SPEICHERUNG, COOKIES & SPIELRESET (`js/storage.js`)

* **Hybrides 2-Ebenen-System:**
  1. `localStorage`: Schneller, permanenter lokaler Speicher.
  2. `document.cookie`: Fallback für In-App-Browser (z.B. Instagram/WhatsApp/Geocaching-App-Webviews) mit 60 Tagen Lebensdauer (`SameSite=Lax`).
* **Storage-Key:** `PK4_TASCHANGO1_STATE` (mit automatischer Migration von `PK4_TSCHANGO_STATE`).
* **Sicherheits-Reset:**
  * Einzel-Level-Reset: Setzt das aktuelle Rätsel zurück.
  * Vollständiger Neustart: Öffnet ein modales Sicherheitsfenster ("Möchtest du wirklich alle Fortschritte löschen?"). Löscht LocalStorage und Cookies restlos.

---

## 6. MOBILE-, TABLET- & TOUCH-UX ARCHITEKTUR

* **Reine Touch-Steuerung:**  
  Alle klobigen Stepper-Buttonleisten wurden eliminiert. Sämtliche Aktionen (Prisma drehen, Knoten ziehen, 3D-Körper rotieren, Walzen drehen, Fadenkreuz bewegen) funktionieren intuitiv direkt auf dem Canvas über `PointerEvents` mit `touch-action: none` (kein unabsichtliches Scrollen).
* **Viewport & Safe Areas:**  
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">` sowie CSS `env(safe-area-inset-bottom)` garantieren fehlerfreie Darstellung auf iPhone-Notch und iPad-Display.
* **Ergonomische Touch-Targets:**  
  Alle Klick- und Touch-Elemente besitzen eine Mindesthöhe von **44–48 Pixeln** (Apple/Google Touch Target Guideline).
* **Smartphone-spezifische Layouts:**  
  * Breakpoint bei `920px` für vertikales Stapeln auf Hochformat-Tablets und Handys.
  * Level 6 Ventilsteuerung schaltet auf Handys in ein handliches 2×2-Raster um.
  * Ziffern-Codes (Level 5 & 7) öffnen mit `inputmode="numeric"` direkt den Ziffernblock auf Smartphones.
* **Orientation Change:**  
  Automatisches Entprellen und Neu-Initialisieren der Canvas-Puffer bei Drehung zwischen Hoch- und Querformat.

---

## 7. SCHUTZ VOR DATENVERLUST & SICHERUNG
Dieses Dokument sowie alle Quellcodedateien (`index.html`, `style.css`, `app.js`, `puzzles.js`, `audio.js`, `crypto.js`, `storage.js`) und Audio-Assets (`audio/funk_*.mp3`) sind im Projektordner `Panzerkvier-main/` persistent gesichert.

