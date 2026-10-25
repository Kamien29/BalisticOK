<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
function reply(int $status, array $body): never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function fail(int $code,string $msg): never {reply($code,['error'=>$msg]);}
if (!is_file(__DIR__.'/config.php')) fail(503,'Brak api/config.php. Skopiuj config.example.php i ustaw hasło.');
$config=require __DIR__.'/config.php';
$token=$config['admin_token']??'';
$storage=$config['storage_dir']??__DIR__.'/storage';
if (!is_string($token)||strlen($token)<24||str_starts_with($token,'CHANGE_')) fail(503,'Ustaw bezpieczny token administratora (min. 24 znaki).');
if (!is_string($storage)||!is_dir($storage)) fail(503,'Utwórz zabezpieczony katalog storage.');
$metadata=$storage.'/media.json';$lockfile=$storage.'/media.lock';
$slots=['gallery','rocket-1','rocket-2','rocket-computer','team-mechanics','team-electronics','team-organization'];
$types=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif'];
function media(string $path): array {if (!file_exists($path)) return ['gallery'=>[],'sections'=>[]];$m=json_decode(file_get_contents($path),true);if (!is_array($m)||!isset($m['gallery'],$m['sections'])||!is_array($m['gallery'])||!is_array($m['sections'])) fail(500,'Uszkodzone metadane galerii.');return $m;}
function normalize(array $m): array {if ($m['sections']===[])$m['sections']=new stdClass();return $m;}
function persist(string $path,array $m): void {$tmp=$path.'.'.bin2hex(random_bytes(8)).'.tmp';if(file_put_contents($tmp,json_encode(normalize($m),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR),LOCK_EX)===false||!rename($tmp,$path)){@unlink($tmp);fail(500,'Błąd zapisu.');}@chmod($path,0600);}
function locked(string $lock, callable $work): never {$h=fopen($lock,'c');if(!$h||!flock($h,LOCK_EX))fail(503,'Zapis jest niedostępny.');try{$work();}finally{flock($h,LOCK_UN);fclose($h);}exit;}
function validId(string $id): bool {return (bool)preg_match('/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/D',$id);}
function auth(string $token): bool {$h=$_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'';if(!$h&&isset($_SERVER['HTTP_X_ADMIN_TOKEN']))$h='Bearer '.$_SERVER['HTTP_X_ADMIN_TOKEN'];return preg_match('/^Bearer (.+)$/',$h,$m)===1&&hash_equals($token,$m[1]);}
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='GET'&&isset($_GET['image'])){
$id=(string)$_GET['image'];if(!validId($id))fail(404,'Brak zdjęcia.');
$m=media($metadata);$image=null;foreach(array_merge($m['gallery'],array_values($m['sections'])) as $entry){if(($entry['id']??'')===$id){$image=$entry;break;}}
if(!$image)fail(404,'Brak zdjęcia.');
$ext=$image['extension']??'';$mime=array_search($ext,$types,true);$path=$storage.'/'.$id.'.'.$ext;
if(!$mime||!is_file($path))fail(404,'Brak zdjęcia.');
header('Content-Type: '.$mime);header('Content-Length: '.filesize($path));header('Cache-Control: public, max-age=31536000, immutable');readfile($path);exit;
}
if($method==='GET')reply(200,normalize(media($metadata)));
if(!in_array($method,['POST','DELETE'],true))fail(405,'Metoda niedozwolona.');
if(!auth($token))fail(401,'Nieprawidłowe hasło administratora.');
if($method==='DELETE'){
$id=(string)($_GET['id']??'');if(!validId($id))fail(400,'Nieprawidłowe ID.');
locked($lockfile,static function()use($metadata,$storage,$id):void{
$m=media($metadata);$removed=null;
foreach($m['gallery'] as $k=>$item){if(($item['id']??'')===$id){$removed=$item;unset($m['gallery'][$k]);}}
$m['gallery']=array_values($m['gallery']);
foreach($m['sections'] as $k=>$item){if(($item['id']??'')===$id){$removed=$item;unset($m['sections'][$k]);}}
if(!$removed)fail(404,'Brak zdjęcia.');persist($metadata,$m);
$ext=$removed['extension']??'';if(in_array($ext,['png','jpg','webp','gif'],true))@unlink($storage.'/'.$id.'.'.$ext);
reply(200,['media'=>normalize($m)]);
});
}
$slot=(string)($_POST['slot']??'');if(!in_array($slot,$slots,true))fail(400,'Nieznana sekcja.');
if(!isset($_FILES['image'])||!is_array($_FILES['image']))fail((int)($_SERVER['CONTENT_LENGTH']??0)>8*1024*1024?413:400,'Brak zdjęcia lub przekroczono limit PHP.');
$file=$_FILES['image'];
if($file['error']!==UPLOAD_ERR_OK)fail(413,'Nie udało się przesłać zdjęcia. Sprawdź limity PHP.');
if(!is_uploaded_file($file['tmp_name'])||$file['size']<1||$file['size']>8*1024*1024)fail(413,'Limit zdjęcia: 8 MB.');
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
if(!isset($types[$mime]))fail(415,'Dozwolone pliki: JPG PNG WEBP GIF.');
$info=@getimagesize($file['tmp_name']);
if(!$info||$info[0]>12000||$info[1]>12000||($info['mime']??'')!==$mime)fail(415,'Nieprawidłowy obraz.');
$extension=$types[$mime];$alt=trim((string)($_POST['alt']??''));$alt=substr($alt?:'Zdjęcie projektu',0,160);
locked($lockfile,static function()use($metadata,$storage,$file,$slot,$extension,$alt):void{
$m=media($metadata);$hex=bin2hex(random_bytes(16));$id=substr($hex,0,8).'-'.substr($hex,8,4).'-'.substr($hex,12,4).'-'.substr($hex,16,4).'-'.substr($hex,20);
$dest=$storage.'/'.$id.'.'.$extension;
if(!move_uploaded_file($file['tmp_name'],$dest))fail(500,'Brak możliwości zapisania pliku.');@chmod($dest,0600);
$item=['id'=>$id,'src'=>'/api/media.php?image='.$id,'alt'=>$alt,'extension'=>$extension];$old=null;
if($slot==='gallery')$m['gallery'][]=$item;else{$old=$m['sections'][$slot]??null;$m['sections'][$slot]=$item;}
persist($metadata,$m);
if($old&&validId($old['id']??'')&&in_array($old['extension']??'',['jpg','png','webp','gif'],true))@unlink($storage.'/'.$old['id'].'.'.$old['extension']);
reply(201,['item'=>$item,'media'=>normalize($m)]);
});
