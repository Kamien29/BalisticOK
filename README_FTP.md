# BalisticOK — instalacja FTP / PHP

Ten wariant nie wymaga Node.js ani Dockera na hostingu. Wymaga **PHP 8.0+**, rozszerzeń `fileinfo` i `json`, prawa zapisu katalogu `api/storage`, obsługi plików `.htaccess` (Apache lub LiteSpeed) i certyfikatu HTTPS. Dla innych serwerów storage koniecznie umieść poza public_html.

## Zbudowanie plików lokalnie
```bash
npm install
npm run build:ftp
```

**Wgraj przez FTP wszystko Z WNĘTRZA katalogu `build/`**, a nie sam folder `build`, do `public_html/` lub `www/`. Zachowaj `api/storage/.htaccess` (w kliencie FTP włącz pokazywanie ukrytych plików).

Skopiuj na serwerze `public_html/api/config.example.php` jako `public_html/api/config.php` i ustaw sekret min. 24 znaków:
```php
<?php
return [
 'admin_token'=>'TUTAJ_LOSOWE_HASLO_MINIMUM_24_ZNAKI',
 'storage_dir'=>__DIR__.'/storage',
];
```

Nie dołączaj `config.php` do repozytorium ani archiwum dla publicznego pobrania. Na hostingu, gdzie PHP nie może tworzyć plików, ustaw prawa zapisu dla `api/storage`. Nie ustawiaj 777, jeśli nie jest konieczne. Domyślny katalog zdjęć jest blokowany przez `.htaccess`; przed wdrożeniem sprawdź, że bezpośredni odczyt `/api/storage/media.json` kończy się 403/404. Jeśli serwer ignoruje `.htaccess`, przenieś `storage_dir` poza public_html.

Strona powinna działać pod HTTPS. Panel na samym dole strony w sekcji „Panel zdjęć” pozwala dodawać/usuwać zdjęcia. Do `api/media.php` wysyłane są pliki JPG/PNG/WEBP/GIF do 8 MB. Jeśli obraz jest odrzucany, sprawdź `upload_max_filesize` i `post_max_size` w PHP (ustaw np. 10M i 12M).
Zdjęcia i baza `media.json` pozostają na serwerze FTP; regularnie kopiuj `api/storage`. Przy ponownym wdrożeniu nie nadpisuj `api/config.php` ani `api/storage`.

## Testy lokalne
```bash
php -l api/media.php
npm run build:ftp
```

Możesz także użyć `python tests/integration_ftp.py` (Python 3 i CLI PHP); test wykorzystuje tymczasowy serwer PHP i nie modyfikuje plików produkcyjnych.

**Ważne**: zdjęcia są publiczne, mogą zawierać dane EXIF. Usuń metadane przed uploadem, jeśli nie chcesz ich publikować.
