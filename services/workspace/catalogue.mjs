const entries=[
 ['lumen','Lumen','A writing desk whose notes grow into connected ideas.','#f5e8cb','#c4893c'],
 ['daylight','Daylight','A flexible planning desk for dates and available slots.','#dceefa','#588cb2'],
 ['threadboard','Threadboard','Review feedback becomes an actionable workspace.','#eadce9','#955c86'],
 ['folio','Folio','A personal collection of references and project material.','#dce8df','#467863'],
 ['relay','Relay','A workspace for explicitly permitted app-to-app data.','#dfe5f5','#536ba1'],
 ['stillroom','Stillroom','Focus sessions with disposable working Surfaces.','#e9e1f4','#8c72a7']
];
// Original bundled, code-native illustrations: no remote assets or brand artwork.
function cover(index,bg,ink){const motifs=[
 '<path d="M100 45h145v100H100z M120 65h100 M120 85h80 M120 105h90"/><circle cx="275" cy="70" r="24"/>',
 '<circle cx="215" cy="75" r="38"/><path d="M90 130h220 M125 110v45 M170 110v45 M215 110v45 M260 110v45"/>',
 '<path d="M90 50h80v45H90z M230 100h80v45h-80z M170 73h50v50h10"/><circle cx="205" cy="123" r="6"/>',
 '<path d="M95 45h145v105H95z M165 75h145v85H165z M105 130l45-40 35 30 25-20"/>',
 '<path d="M75 60h90v80H75z M235 60h90v80h-90z M175 100h50 M205 90l20 10-20 10"/>',
 '<circle cx="200" cy="100" r="65"/><circle cx="200" cy="100" r="42"/><path d="M200 70v32l25 15"/>'
 ];return'data:image/svg+xml;base64,'+Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" rx="18" fill="${bg}"/><g fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${motifs[index]}</g></svg>`).toString('base64');}
export const catalogue=entries.map(([id,name,purpose,bg,ink],i)=>({id,name,purpose,cover:cover(i,bg,ink)}));
