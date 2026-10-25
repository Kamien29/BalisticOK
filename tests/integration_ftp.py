import base64,http.client,json,pathlib,shutil,socket,subprocess,tempfile,time
root=pathlib.Path(__file__).resolve().parents[1]
token='super-strong-test-admin-token-123456789'
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4BZn8AAAAASUVORK5CYII=')
def req(port,method,path,data=None,headers=None):
 c=http.client.HTTPConnection('127.0.0.1',port,timeout=5);c.request(method,path,data,headers or {});r=c.getresponse();status=r.status;body=r.read();c.close();return status,body
def form(slot,alt,payload):
 boundary='--balistic-test-boundary';body=(f'--{boundary}\r\nContent-Disposition: form-data; name="slot"\r\n\r\n{slot}\r\n--{boundary}\r\nContent-Disposition: form-data; name="alt"\r\n\r\n{alt}\r\n--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="a.png"\r\nContent-Type: image/png\r\n\r\n').encode()+payload+f'\r\n--{boundary}--\r\n'.encode()
 return body,{'Content-Type':'multipart/form-data; boundary='+boundary,'Authorization':'Bearer '+token}
with tempfile.TemporaryDirectory() as tmp:
 public=pathlib.Path(tmp)/'public';shutil.copytree(root/'api',public/'api')
 (public/'api'/'config.php').write_text("<?php return ['admin_token'=>'"+token+"', 'storage_dir'=>__DIR__.'/storage'];")
 with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
 process=subprocess.Popen(['php','-S',f'127.0.0.1:{port}','-t',str(public)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  for i in range(50):
   try: status,body=req(port,'GET','/api/media.php');break
   except OSError:time.sleep(.1)
  assert status==200 and json.loads(body)=={'gallery':[],'sections':{}},(status,body)
  data,headers=form('gallery','Galeria test',png)
  assert req(port,'POST','/api/media.php',data,{'Content-Type':headers['Content-Type']})[0]==401
  status,body=req(port,'POST','/api/media.php',data,headers);assert status==201,(status,body)
  item=json.loads(body)['item'];assert req(port,'GET',item['src'])[0]==200
  assert len(json.loads(req(port,'GET','/api/media.php')[1])['gallery'])==1
  data,headers=form('rocket-1','Rocket 1',png);status,body=req(port,'POST','/api/media.php',data,headers);assert status==201,(status,body);old=json.loads(body)['item']
  data,headers=form('rocket-1','Rocket 2',png);status,body=req(port,'POST','/api/media.php',data,headers);assert status==201,(status,body)
  assert req(port,'GET',old['src'])[0]==404
  data,headers=form('gallery','PHP script',b'<?php echo 1;');assert req(port,'POST','/api/media.php',data,headers)[0]==415
  data,headers=form('bad-slot','Bad',png);assert req(port,'POST','/api/media.php',data,headers)[0]==400
  assert req(port,'DELETE','/api/media.php?id='+item['id'])[0]==401
  assert req(port,'DELETE','/api/media.php?id='+item['id'],headers={'Authorization':'Bearer '+token})[0]==200
  assert req(port,'GET',item['src'])[0]==404
  assert (public/'api'/'storage'/'media.json').exists()
  print('PASS: FTP PHP integration (auth, upload, read, replace, delete, bad format, persistence)')
 finally:process.terminate();process.wait(timeout=5)
