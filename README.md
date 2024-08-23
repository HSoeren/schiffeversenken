# Schiffe Versenken

.. als Bogenscheibe

Bisher wurden die Scheiben immer per Hand gemalt. Als Webseite mit JavaScript kann jetzt jederzeit eine neue Scheibe erstellt werden.

## Features

- 🎯 Scheiben erstellen und herunterladen
- 🎯 Passenden Spielplan herunterladen
- 🎯 Seeded Zufallsgenerator (wird der gleiche Seed verwendet, wird die gleiche Scheibe erstellt)

## Anleitung

Rechts am Rand einfach so lange auf _Neue Scheibe_ klicken, bis die Scheibe gefällt. Dann auf _Scheibe (SVG)_ klicken, um die Scheibe herunterzuladen - oder _Spielplan (SVG)_ für den passenden Spielplan.

Auf beiden SVGs sind in einem Feld in eckigen Klammern der Hinweis auf den verwendeten Seed zu finden. Falls die Scheibe nochmal erstellt werden soll, kann dieser Seed in das entsprechende Feld eingegeben werden und die SVGs erneut heruntergeladen werden.

## Development

- Repository klonen
- `bun install` ausführen
    - `bun` nicht verfügbar? [Bun installieren](https://bun.sh/docs/installation)
- `bun run dev` ausführen
- Webseite ist unter [localhost:8080](http://localhost:8080) erreichbar.

## Install / Deploy

Dank Docker kann die Webseite einfach darüber ausgeliefert werden. 

- `docker build -t schiffe-versenken .`
- `docker run -d -p 3000:80 schiffe-versenken`

## ToDo

- [ ] Am Ende müssen die Gitterlinien über den Schiffen nochmal erneuert werden, wo ein Schiff drunter ist, muss die Linie weiß sein, um möglichst viel Kontrast zu bieten. -> Vielleicht besser in den Grafiken direkt erledigen

