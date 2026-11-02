// Generates app icons with the production image model (PROD_IMAGE_MODEL). Each image is one paid request.
//   node --env-file=.env scripts/generate-icons.mjs bundled [id ...]   built-in and App Store icons (maintainers, macOS sips converts to 256 px PNG)
//   node --env-file=.env scripts/generate-icons.mjs app <app-id>       one registered app, stored in Core's private home
import{mkdir,writeFile}from'node:fs/promises';import{execFileSync}from'node:child_process';import{join,resolve}from'node:path';import{DatabaseSync}from'node:sqlite';
import{imageConfig,generateImage,iconPrompt}from'./lib/inference.mjs';import{AppIcons,iconDirectory}from'../services/workspace/app-icons.mjs';import{entries}from'../services/workspace/catalogue.mjs';
const[mode,...ids]=process.argv.slice(2),config=imageConfig();if(!config)throw new Error('Set PROD_IMAGE_MODEL (with the PROD_ endpoint and key) to generate icons.');
const home=resolve(process.env.MALLEA_HOME??'.mallea');
if(mode==='bundled'){
 const bundled=[['mallea-core','Mallea Core','a calm home for discovering, creating and connecting malleable desktop apps','olive green'],['scratchpad-main','Fieldnote','a personal studio for annotating artwork and saving design revisions','warm amber'],['review-main','Parcel','a review desk for saved artwork and written feedback','indigo'],
  ...entries.map(([id,name,purpose,bg,ink,category])=>['store-'+id,name,category+' app: '+purpose.toLowerCase(),'soft '+category.toLowerCase()+' tone matching '+ink])];
 const source=join(home,'icons','bundled-source');await mkdir(source,{recursive:true});await mkdir(iconDirectory,{recursive:true});
 for(const[id,name,purpose,colour]of bundled.filter(b=>!ids.length||ids.includes(b[0]))){const image=await generateImage(config,iconPrompt(name,purpose,colour)),raw=join(source,id+'.'+image.type.split('/')[1]);await writeFile(raw,image.bytes);
  try{execFileSync('sips',['-s','format','png','-Z','256',raw,'--out',join(iconDirectory,id+'.png')],{stdio:'ignore'});console.log('Icon:',id);}catch{console.log('Generated',raw,'— convert it to a 256 px PNG at',join(iconDirectory,id+'.png'));}}
}else if(mode==='app'&&ids.length===1){
 const db=new DatabaseSync(process.env.MALLEA_DB??join(home,'workspace.sqlite'),{readOnly:true}),row=db.prepare('SELECT manifest FROM engine_apps WHERE id=?').get(ids[0]);db.close();if(!row)throw new Error('App is not registered with Core.');
 const m=JSON.parse(row.manifest);await new AppIcons({home}).create({appId:m.id,name:m.name,purpose:m.purpose,adapter:m.adapter});console.log('Icon generated for',m.name);
}else throw new Error('Usage: generate-icons.mjs bundled [id ...] | app <app-id>');
