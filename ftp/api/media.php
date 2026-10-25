<?php
declare(strict_types=1);
// BalisticOK — PHP 8.0+ API for a regular FTP hosting account.
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
function respond(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(int $status, string $reason): never { respond($status, ['error' => $reason]); }
$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) fail(503, 'Skonfiguruj api/config.php na serwerze.');
$config = require $configFile;
$token = $config['admin_token'] ?? null;
$storage = $config['storage_dir'] ?? (__DIR__ . '/storage');
if (!is_string($token) || strlen($token) < 24 || str_starts_with($token, 'CHANGE_')) {
    fail(503, 'Administrator musi ustawić bezpieczny admin_token (minimum 24 znaki).');
}
if (!is_string($storage) || $storage === '') fail(503, 'Błędny katalog przechowywania plików.');
if (!is_dir($storage) && !@mkdir($storage, 0700, true) && !is_dir($storage)) {
    fail(503, 'Brak dostępu do katalogu zdjęć.');
}
$storage = realpath($storage) ?: $storage;
$metaPath = $storage . '/media.json';
$lockPath = $storage . '/media.lock';
$allowedSlots = ['gallery', 'rocket-1', 'rocket-2', 'rocket-computer', 'team-mechanics', 'team-electronics', 'team-organization'];
$types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$maxBytes = 8 * 1024 * 1024;
function getMedia(string $file): array {
    if (!is_file($file)) return ['gallery' => [], 'sections' => new stdClass()];
    $value = json_decode((string) file_get_contents($file), true);
    if (!is_array($value) || !isset($value['gallery'], $value['sections']) ||
        !is_array($value['gallery']) || !is_array($value['sections'])) {
        fail(500, 'Nieprawidłowe metadane galerii. Przywróć kopię zapasową.');
    }
    return $value;
}
function normalizedMedia(array $media): array {
    if (isset($media['sections']) && $media['sections'] === []) $media['sections'] = new stdClass();
    return $media;
}
function saveMedia(string $file, array $media): void {
    $temp = $file . '.' . bin2hex(random_bytes(8)) . '.tmp';
    $contents = json_encode(normalizedMedia($media), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    if (file_put_contents($temp, $contents, LOCK_EX) === false || !@rename($temp, $file)) {
        @unlink($temp);
        fail(500, 'Błąd zapisu galerii.');
    }
    @chmod($file, 0600);
}
function withLock(string $lockFile, callable $action): never {
    $handle = @fopen($lockFile, 'c');
    if ($handle === false || !flock($handle, LOCK_EX)) fail(503, 'Nie można zablokować zapisu zdjęć.');
    try { $action(); }
    finally { flock($handle, LOCK_UN); fclose($handle); }
    exit;
}
function authorized(string $expected): bool {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($header === '' && isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $header = 'Bearer ' . $_SERVER['HTTP_X_ADMIN_TOKEN'];
    }
    if (!preg_match('/^Bearer (.+)$/', $header, $match)) return false;
    return hash_equals($expected, $match[1]);
}
function isUuid(string $id): bool {
    return (bool) preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/D', $id);
}
function idToUuid(string $hex): string {
    return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4) . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20, 12);
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET' && isset($_GET['image'])) {
    $imageId = (string) $_GET['image'];
    if (!isUuid($imageId)) fail(404, 'Nie znaleziono zdjęcia.');
    $media = getMedia($metaPath);
    $items = array_merge($media['gallery'], array_values($media['sections']));
    $found = null;
    foreach ($items as $item) {
        if (($item['id'] ?? '') === $imageId) { $found = $item; break; }
    }
    if ($found === null) fail(404, 'Nie znaleziono zdjęcia.');
    $extension = $found['extension'] ?? '';
    $mime = array_search($extension, $types, true);
    if (!is_string($mime)) fail(404, 'Nie znaleziono zdjęcia.');
    $filename = $storage . '/' . $imageId . '.' . $extension;
    if (!is_file($filename)) fail(404, 'Nie znaleziono zdjęcia.');
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Content-Length: ' . filesize($filename));
    readfile($filename);
    exit;
}
if ($method === 'GET') respond(200, normalizedMedia(getMedia($metaPath)));
if ($method !== 'POST' && $method !== 'DELETE') fail(405, 'Metoda niedozwolona.');
if (!authorized($token)) fail(401, 'Nieprawidłowe hasło administratora.');
if ($method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    if (!isUuid($id)) fail(400, 'Nieprawidłowy identyfikator.');
    withLock($lockPath, static function () use ($metaPath, $id, $storage): void {
        $media = getMedia($metaPath);
        $removed = null;
        foreach ($media['gallery'] as $index => $item) {
            if (($item['id'] ?? '') === $id) { $removed = $item; unset($media['gallery'][$index]); }
        }
        $media['gallery'] = array_values($media['gallery']);
        foreach ($media['sections'] as $slot => $item) {
            if (($item['id'] ?? '') === $id) { $removed = $item; unset($media['sections'][$slot]); }
        }
        if ($removed === null) fail(404, 'Nie znaleziono zdjęcia.');
        saveMedia($metaPath, $media);
        $extension = $removed['extension'] ?? '';
        if (in_array($extension, ['png', 'jpg', 'webp', 'gif'], true)) {
            @unlink($storage . '/' . $id . '.' . $extension);
        }
        respond(200, ['media' => normalizedMedia($media)]);
    });
}
$slot = (string) ($_POST['slot'] ?? '');
if (!in_array($slot, $allowedSlots, true)) fail(400, 'Nieznana sekcja zdjęć.');
if (empty($_FILES['image']) || !is_array($_FILES['image'])) {
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    fail($length > $maxBytes ? 413 : 400, 'Nie otrzymano zdjęcia (sprawdź limity upload_max_filesize/post_max_size PHP).');
}
$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) fail(($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) ? 413 : 400, 'Przesyłanie pliku nie powiodło się.');
if (!is_uploaded_file($file['tmp_name'])) fail(400, 'Nieprawidłowy plik.');
if ($file['size'] < 1 || $file['size'] > $maxBytes) fail(413, 'Limit wynosi 8 MB.');
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!is_string($mime) || !isset($types[$mime])) fail(415, 'Dozwolone formaty: JPG, PNG, WEBP, GIF.');
$dimensions = @getimagesize($file['tmp_name']);
if (!$dimensions || $dimensions[0] < 1 || $dimensions[1] < 1 || $dimensions[0] > 12000 || $dimensions[1] > 12000 || ($dimensions['mime'] ?? null) !== $mime) {
    fail(415, 'Uszkodzony lub nieprawidłowy obraz.');
}
$alt = trim((string) ($_POST['alt'] ?? ''));
$alt = preg_replace('/[\x00-\x1F\x7F]/u', '', $alt) ?? '';
$alt = function_exists('mb_substr') ? mb_substr($alt, 0, 160) : substr($alt, 0, 160);
if ($alt === '') $alt = 'Zdjęcie projektu';
$extension = $types[$mime];
withLock($lockPath, static function () use ($file, $extension, $slot, $alt, $storage, $metaPath): void {
    $media = getMedia($metaPath);
    $id = idToUuid(bin2hex(random_bytes(16)));
    $target = $storage . '/' . $id . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $target)) fail(500, 'Nie udało się zapisać zdjęcia na serwerze.');
    @chmod($target, 0600);
    $item = ['id' => $id, 'src' => '/api/media.php?image=' . $id, 'alt' => $alt, 'extension' => $extension];
    $old = null;
    if ($slot === 'gallery') {
        $media['gallery'][] = $item;
    } else {
        $old = $media['sections'][$slot] ?? null;
        $media['sections'][$slot] = $item;
    }
    try { saveMedia($metaPath, $media); }
    catch (Throwable $e) { @unlink($target); throw $e; }
    if (is_array($old) && isUuid((string) ($old['id'] ?? '')) && in_array($old['extension'] ?? '', ['png', 'jpg', 'webp', 'gif'], true)) {
        @unlink($storage . '/' . $old['id'] . '.' . $old['extension']);
    }
    respond(201, ['item' => $item, 'media' => normalizedMedia($media)]);
});
