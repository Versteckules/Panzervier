# Panzerknacker IV: Projekt Taschango1 / Der Ausbruch

Das vierte offizielle Geocaching-Abenteuer der Panzerknacker-Reihe (D4/D5 High-End Heist Edition).
**Mastermind Taschango1** leitet die Mission aus der Zentrale, während **Agent Versteckules** das Bunkerareal infiltriert.

---

## 🌟 Übersicht & Feinschliff

1. **Rollenverteilung & Storyline**:
   - **Taschango1** (`tschango.jpg`): Das Mastermind, Boss und Drahtzieher im Hauptquartier.
   - **Versteckules** (`Avatar.jpg`): Agent 01 im Feldeinsatz vor Ort.
   - Alle 10 Missionsdossiers sind verschlüsselte Funksprüche von Mastermind Taschango1 an Agent Versteckules.
2. **Authentische Vollbild-Eingangsseite**:
   - Die Status- und Kopfleiste ist auf dem Startbildschirm komplett ausgeblendet.
   - `tschango.jpg` (*Mastermind*) und `Avatar.jpg` (*Agent Versteckules*) werden in voller Größe nebeneinander als stilisierte Cyber-Ausweise präsentiert.
   - Reaktionsschnelle Startknöpfe: Neuer Einsatz startet bei Sektor 01, bestehende Spielstände bieten direkt *Fortsetzen* oder *Neustart*.
3. **High-End Grafik & Design**:
   - Multi-Pass Laser-Glow (äußere Aura, intensiver Neon-Kanal und weißer Kern).
   - Skeuomorphe Instrumente: Gefräste Safe-Zahlenräder, 3D-Manometer mit Messingring, echter PCB-Schaltkreis mit Goldleiterbahnen und CRT-Phosphor-Oszilloskope.
   - Gestochen scharfe HiDPI-Vektorskalierung (`devicePixelRatio`) ohne Pixelartefakte.
   - 100% mobil- und tabletoptimiert mit `touch-action: none` ohne ungewolltes Scrollen.
4. **Urige Fränkische Funk-Sprachausgabe (Walkie-Talkie FX)**:
   - Alle 10 Funksprüche von Taschango1 können direkt im Dossier mit einem Klick auf **`📻 FUNKSPRUCH ABHÖREN (FRÄNKISCH)`** als MP3 mit echtem Funkgeräte-Rauschen, Roger-Piepen und Bandpass-Filter angehört werden.
   - Alle MP3s liegen sauber abgelegt in `audio/funk_1.mp3` bis `funk_10.mp3` und können bei Bedarf jederzeit durch eigene private Audioaufnahmen ersetzt werden.
5. **Reine D4/D5-Kopfnüsse ohne Spoiler**:
   - Reine Logik und Beobachtungsgabe – keine vorweggenommenen Zahlen in den Anweisungen.
5. **Kryptografische Sicherheit**:
   - Die Zielkoordinaten **`N 50° 09.502' E 012° 07.467'`** sind mit einer 256-Bit SHA-256 Kette verriegelt und können vorab nicht aus dem Quelltext ausgelesen werden.

---

## 🔑 Musterlösung aller 10 Level (Für den Cache-Owner)

| Level | Station | Mechanik | Lösung / Interaktion |
|---|---|---|---|
| **01** | Prisma-Spektrallabor | Canvas-Optik & Lichtbrechung | Richte das Prisma aus, bis Grün waagerecht auf Sensor **β** trifft. Schiebe Linse **L1** nach oben (Sensor **α**) und Linse **L2** nach unten (Sensor **γ**). |
| **02** | Laser-Knoten Entwirrung | Planar Graph (Untangle) | Ziehe die Knoten um, bis **keine rote Laserlinie mehr existiert** (alle Linien werden grün). |
| **03** | Körperschall-Tresor | Akustische Körperschall-Resonanz | Drehe das Rad und beobachte den Oszillographen rechts. Raste die Scheiben bei maximalem Ausschlag ein: **`38`**, **`74`**, **`19`**. |
| **04** | Platinen-Kacheln | Rotierender Schaltkreis | Tippe auf die Kacheln, um sie zu drehen, bis die goldene Leitung von oben links (Eingang) nach unten rechts (Ausgang) leuchtet. |
| **05** | Frequenz-Spektrogramm | Signal-Entstörung mit 3 Filtern | Regler einstellen: **HPF = 850 Hz**, **LPF = 4200 Hz**, **NOTCH = 500 Hz**. Code: **`7429`**. |
| **06** | Druckventil-Hydraulik | 4-Manometer-Gleichgewicht | Schalte **Ventil I**, **Ventil II** und **Ventil IV** ein (Ventil III aus). Alle 4 gekoppelten Manometer pegeln sich exakt bei **3.5 Bar** ein. |
| **07** | Laser-Lichtschranken-Parcours | Optische Reflexion & Bypass | Tippe auf die 4 Prismenspiegel, um sie einzustellen: **Spiegel α = 45°**, **Spiegel β = 45°**, **Spiegel γ = 135°**, **Spiegel δ = 135°**. Der Laserstrahl umgeht alle Alarm-Sensoren und speist den grünen Bypass-Kollektor ein! |
| **08** | Konzentrische Krypto-Walze | 3 Messingringe mit Schaltfolge | Ringe drehen, bis am oberen roten Pfeil **Außen: C**, **Mitte: 2** und **Innen: VII** stehen. |
| **09** | Planetengetriebe | Epizyklische Zahnrad-Synchronisation | Zähne auf **`20`** stellen und auf "Getriebe kuppeln" klicken. |
| **10** | Flucht-Vektorplotter | Satelliten-Triangulation & Finale | Fadenkreuz auf den Schnittpunkt der drei Funkkreise ziehen. Sobald es grün einrastet: "Zündung starten". |

---

## 🎯 Finale Koordinaten
Nach Lösung von Level 10 werden die Zielkoordinaten live entschlüsselt:
```
N 50° 09.502'  E 012° 07.467'
```
Mit einem Klick auf **"KOORDINATEN KOPIEREN 📋"** werden sie direkt in die Zwischenablage kopiert.
