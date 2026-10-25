# BalisticOK — instalacja na własnym serwerze

Projekt zawiera stronę React, serwer Node.js i upload zdjęć do galerii, trzech kart rakiety i trzech kart zespołu. Zdjęcia zapisują się trwale w katalogu `/app/data`, a usuwanie oraz dodawanie wymaga hasła administratora.

## Instalacja Docker + domena (zalecana)

Wymagane: VPS Linux, Docker Engine z Docker Compose, rekord A (oraz AAAA, jeśli dotyczy) domeny skierowany na IP VPS i otwarte porty 80/443.

1. Sklonuj repozytorium, wybierz gałąź `feat/self-hosted-media`.
2. Wykonaj `cp .env.example .env`.
3. W pliku `.env` ustaw `DOMAIN` na własną domenę i `ADMIN_TOKEN` na wygenerowany sekret (minimum 24 znaki, np. `openssl rand -hex 32`).
4. Wykonaj `docker compose up -d --build`.
5. Otwórz `https://twoja-domena.pl/#admin` i wpisz sekret, aby dodawać lub usuwać zdjęcia. Caddy automatycznie obsłuży HTTPS, jeśli domena i porty działają.

**Ważne:** Dane zdjęć są w wolumenie Docker `balistic_data`. Rób backup całego wolumenu, w tym `media.json` i `uploads/`. Nie uruchamiaj `docker compose down -v` bez kopii. Hasło `.env` nie jest commitowane.

## Lokalnie

Node.js 22 LTS. Wykonaj `npm ci && npm run build`, a potem `ADMIN_TOKEN=twoje-bardzo-dlugie-haslo-admina npm run serve` (strona na porcie 3000).
Dla produkcji bez Dockera ustaw `DATA_DIR`, `ADMIN_TOKEN`, `PORT` i reverse proxy HTTPS na lokalny port 3000.
API: `GET /api/media`, `POST /api/media?slot=gallery&alt=opis` z Bearer token, `DELETE /api/media/:id` z Bearer token. Format: JPG/PNG/WEBP/GIF, maks. 8 MB.
Sekcje inne niż galeria przyjmują po jednym zdjęciu — upload nowego zastępuje stare. Galeria ma wiele zdjęć.
Zdjęcia są publiczne, więc nie dodawaj poufnych plików ani zdjęć z prywatnymi danymi EXIF.

## Wersja na zwykły hosting FTP (PHP)

Zobacz [README_FTP.md](README_FTP.md): `npm run build:ftp`, następnie prześlij zawartość `build/` przez FTP i ustaw `api/config.php`.
