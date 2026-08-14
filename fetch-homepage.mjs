import http from 'http';

(async ()=>{
  try{
    const get = (path)=> new Promise((res, rej)=>{
      http.get({hostname:'127.0.0.1', port:8080, path, timeout:5000}, (r)=>{
        let s=''; r.on('data',c=>s+=c); r.on('end',()=>res({statusCode:r.statusCode, body:s}));
      }).on('error', e=>rej(e));
    });

    const root = await get('/');
    console.log('Root status', root.statusCode, 'len', root.body.length);
    const admin = await get('/admin/login');
    console.log('/admin/login status', admin.statusCode, 'len', admin.body.length);

  }catch(err){ console.error('HTTP check failed:', err.message); process.exit(1);} 
})();
