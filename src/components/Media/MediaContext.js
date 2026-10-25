import {createContext,useContext,useEffect,useState} from 'react';
const Context=createContext(null);
export function MediaProvider({children}){
 const [media,setMedia]=useState({gallery:[],sections:{}}),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{fetch(process.env.REACT_APP_MEDIA_API || '/api/media',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Nie można pobrać zdjęć');return r.json()}).then(setMedia).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <Context.Provider value={{media,setMedia,loading,error}}>{children}</Context.Provider>;
}
export function useMedia(){return useContext(Context)}
