import {useMedia} from './MediaContext';
export function SectionImage({slot,placeholder}){const {media}=useMedia();const item=media.sections[slot];return item?<img className="section-uploaded-image" src={item.src} alt={item.alt} loading="lazy"/>:<div className="section-image-placeholder"><span>{placeholder}</span></div>}
