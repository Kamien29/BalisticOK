import {useState} from 'react';
import {useMedia} from './MediaContext';
const slots=[['gallery','Galeria'],['rocket-1','Rakieta: stopień I'],['rocket-2','Rakieta: stopień II'],['rocket-computer','Komputer pokładowy'],['team-mechanics','Zespół: mechanika'],['team-electronics','Zespół: elektronika'],['team-organization','Zespół: organizacja']];
export function MediaAdmin(){
 const {media,setMedia}=useMedia();
 const [token,setToken]=useState(''),[slot,setSlot]=useState('gallery'),[alt,setAlt]=useState(''),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const items=[...media.gallery,...Object.values(media.sections)];
 async function request(url,options){const r=await fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+token}});const body=await r.json();if(!r.ok)throw Error(body.error||'Błąd serwera');setMedia(body.media);}
 async function upload(e){e.preventDefault();if(!file)return;setBusy(true);setMessage('');try{
 if(file.size>8*1024*1024)throw Error('Limit wynosi 8 MB');
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw Error('Nieprawidłowy format');
 await request('/api/media?'+new URLSearchParams({slot,alt}),{method:'POST',headers:{'Content-Type':file.type},body:file});
 e.target.reset();setAlt('');setFile(null);setMessage('Zdjęcie zostało zapisane.');
 }catch(err){setMessage(err.message)}finally{setBusy(false)}}
 async function remove(id){if(!window.confirm('Usunąć zdjęcie?'))return;setBusy(true);setMessage('');try{await request('/api/media/'+encodeURIComponent(id),{method:'DELETE'});setMessage('Zdjęcie usunięte.')}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 return <section id="admin" className="section section-alt"><div className="section-header"><h2>Panel zdjęć</h2><p>Dodaj zdjęcia do galerii oraz sekcji strony. Przesłane zdjęcia są publiczne.</p></div>
 <div className="glass media-admin"><form onSubmit={upload} className="media-admin-form">
 <label>Hasło administratora<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required/></label>
 <label>Sekcja<select value={slot} onChange={e=>setSlot(e.target.value)}>{slots.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <label>Opis<input maxLength={160} value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Opis zdjęcia"/></label>
 <label>Zdjęcie (JPG, PNG, WEBP, GIF, max 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>setFile(e.target.files?.[0]||null)} required/></label>
 <button className="btn primary" type="submit" disabled={!token||!file||busy}>Dodaj zdjęcie</button>
 </form>{message&&<p role="status">{message}</p>}<h3>Zdjęcia ({items.length})</h3>
 <div className="media-admin-grid">{items.map(item=><div key={item.id} className="media-admin-item"><img src={item.src} alt={item.alt} loading="lazy"/><span>{item.alt}</span><button type="button" disabled={busy||!token} onClick={()=>remove(item.id)}>Usuń</button></div>)}</div>
 </div></section>
}
