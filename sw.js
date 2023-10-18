console.log('SERVICEWORKER');
//App shell son todos aquellos recursos propios de la aplicación 
const STATIC='staticv1';
const INMUTABLE='inmutablev1';
const DYNAMIC='dynamicv1';
const STATIC_LIMIT=15;
const DYNAMIC_LIMIT=30;
const APP_SHELL=[
'/',
'/index.html',
'css/styles.css',
'img/perrito.jpg',
'js/app.js',
'pages/offline.html'
];
//Todos aquellos recursos que nunca cambian, nuestros o externos 
const APP_SHELL_INMUTABLE=[
'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js'
]

self.addEventListener('install',(e)=>{
    console.log('instalado')
    //e.skipWaiting()
    const staticCache=caches.open(STATIC).then((cache)=>{
        cache.addAll(APP_SHELL);
    });
    const inmutableCache=caches.open(INMUTABLE).then((cache)=>{
        cache.addAll(APP_SHELL_INMUTABLE);
    });
    e.waitUntil(Promise.all([staticCache,inmutableCache]));
})



self.addEventListener('activate',(e)=>{
    console.log('Activado')
})


self.addEventListener('fetch',(e)=>{
    // console.log(e.request)
    // if(e.request.url.includes('gatito.jpg'))
    // e.respondWith(fetch('img/gatitomiel.jpg'))
    // else e.respondWith(fetch(e.request))
    
    //1.Cache only, toda la aplicación va as er servida por el cache
    //e.respondWith(caches.match(e.request))
    //2. cache with network fallback/ si el recurso no se encuentra en internet va al caché
    // const source=caches.match(e.request).then((res)=>{
    //     if(res) return res;
    //     return fetch(e.request).then(resFetch =>{
    //         caches.open(DYNAMIC).then(cache=>{
    //             cache.put(e.request, resFetch)
    //         })
    //         return resFetch.clone()
    //     });
    // });
    // e.respondWith(source);
    //3. Network with cache fallback / siempre va a estar actualizada pero cuano no haya internet va a usar el cache
    //lo contrario a la segunda 
    // const source=fetch(e.request).then(res=>{
    //     if(!res) throw Error('NotFound');
    //     //checar si el recurso existe en la cache
    //     caches.open(DYNAMIC).then(cache=>{
    //         cache.put(e.request, res);
    //     });
    //     return res.clone();
    // }).catch(err=>{
    //     return caches.match("pages/offline.html");
    // })
    // e.respondWith(source);
    //4. Cache with network update 
    //siempre actualizada si hay recurso actualizado devuelve el actual pero lo actualiza al instante
    //usarla cuando tenga un rendimiento critico, si el rendimiento es bajo utilizar esta estrategia
    //Desventaja es que toda la app esta un paso atras. 
    // if(e.request.url.includes('boostrap'))
    // return e.respondWith(caches.match(e.request));
    // const source= caches.open(STATIC).then(cache=>{
    //     fetch(e.request).then(res=>{
    //         cache.put(e.request, res)
    //     })
    //     return cache.match(e.request);
    // });
    // e.respondWith(source);

    //5.- Chache and network race, se mandan las dos promesas y la primra que llegue es la que se va a mostrar
    // const source = new Promise((resolve, reject)=>{
    //     let rejected = false;
    //     const failsOnce = ()=>{ //comprueba si el recurso solicitado falló una vez (fetch o catch)
    //         if(reject){
    //             if(/\.(png|jpg)/i.test(e.request.url)){
    //                 resolve(caches.match('/img/not-found.png'));
    //             }else{
    //                 //reject('SourceNotFound');
    //                 if(e.request.url.includes('page2.html')){

    //                 }
    //             }
    //         }else{
    //             rejected=true;
    //         }
    //     };
    //     // solicitar tanto en internet como en la cache
    //     // se ponen en una carrera para ver quien se ejecuta primero
    //     fetch(e.request).then(res=>{
    //         res.ok ? resolve(res) : failsOnce();
    //     }).catch(failsOnce);
    //     caches
    //      .match(e.request)
    //      .then((cacheRes)=>{
    //         cacheRes.ok ? resolve(cacheRes) : failsOnce();
    //      })
    //      .catch(failsOnce);
    // });
    // e.respondWith(source);

})

// self.addEventListener('push',(e)=>{
//     console.log('Notificacion push')
// })

// self.addEventListener('sync',(e)=>{
//     console.log('sync event')
// })



/*
por medio de alguna estrategia de cache y el evento
fetch mostrar en pantalla la pagina offline cuando
se solicite el recurso page2.html
y no haya internet
*/



self.addEventListener('fetch', (e) => {
  
     const source= fetch(e.request).then(res => {
          if (e.request.url.includes('/index.html')) {
              caches.open(DYNAMIC).then(cache => {
                  cache.put(e.request, res.clone());
              });
          }
          return res;
      }).catch(err => {
          return caches.match(e.request).then(cachedResponse => {
              if (cachedResponse) {
                  return cachedResponse;
              } else {
                  return caches.match('pages/offline.html');
              }
          });
      })
    e.respondWith(source);
});
