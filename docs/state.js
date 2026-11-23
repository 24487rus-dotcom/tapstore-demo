const DEMO_BASE = new URL('.',import.meta.url).pathname;
const storageKey = 'tapstore-public-demo-v1';
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const roles = {owner:'Владелец',seller:'Сотрудник',buyer:'Покупатель'};
const accountFor = role => ({email:role+'@demo.example',role,slug:role === 'buyer' ? null : 'demo',enabled:1,can_edit_prices:1});
function navigateDemo(hash) {
  const target = new URL(location.href);
  target.hash = hash;
  if(target.href === location.href) location.reload();
  else location.href = target.href;
}
function seed() {
  const created = new Date().toISOString();
  return {stores:[{slug:'demo',name:'Хмельная лавка · демо',address:'Самара, ул. Демонстрационная, 12',description:'Небольшой магазин с подборкой закусок, напитков и подарков. Выберите товары заранее — мы подготовим их к визиту.',contact:'+7 (000) 000-00-00 · демо',hours:'Ежедневно 10:00–22:00',template:'sky',delivery_enabled:1,published:1}],
    accounts:Object.keys(roles).map(accountFor),
    products:[{id:1,slug:'demo',name:'Сырные палочки',price:240,discount:10,active:1,in_stock:1},
      {id:2,slug:'demo',name:'Лимонад «Лимон и мята»',variants:'Охлаждённый|Комнатной температуры',price:160,discount:0,active:1,in_stock:1},
      {id:3,slug:'demo',name:'Ореховый микс',price:290,discount:15,active:1,in_stock:1},
      {id:4,slug:'demo',name:'Подарочный бокал',price:650,discount:0,active:1,in_stock:0}],
    requests:[{id:1,slug:'demo',name:'Анна',status:'new',created,items:[{name:'Сырные палочки',price:216,qty:2}],total:432},
      {id:2,slug:'demo',name:'Михаил',status:'ready',created,items:[{name:'Лимонад «Лимон и мята»',price:160,qty:1}],total:160},
      {id:3,slug:'demo',name:'Покупатель',status:'completed',created,completed_at:created,buyer_email:'buyer@demo.example',items:[{name:'Ореховый микс',price:247,qty:2}],total:494}],
    entries:[{id:1,slug:'demo',kind:'expense',amount:18000,category:'Закупки',note:'Демонстрационная закупка',date:today(),key:'seed'}],nextProduct:5,nextOrder:4,nextEntry:2};
}
function read() {
  const value = localStorage.getItem(storageKey);
  if (!value) { const state=seed(); save(state); return state; }
  return JSON.parse(value);
}
function save(state) {
  try { localStorage.setItem(storageKey,JSON.stringify(state)); }
  catch { throw new Error('В браузере недостаточно места. Уменьшите фотографии или сбросьте демо.'); }
}
function fail(message,status=400) { throw Object.assign(new Error(message),{status}); }
const salePrice = product => Math.max(1,Math.round(product.price*(100-product.discount)/100));
const safe = value => String(value ?? '').trim();
const nextId = rows => Math.max(0,...rows.map(row => row.id))+1;
export async function demoApi(input,data) {
  const url = new URL(input,location.origin), route=url.pathname;
  const state=read(), role=sessionStorage.getItem('tapstore-demo-role');
  const user=state.accounts.find(account => account.role === role && account.email === (sessionStorage.getItem('tapstore-demo-email') || role+'@demo.example') && account.enabled);
  const storeSlug = url.searchParams.get('store') || user?.slug || 'demo';
  const store=state.stores.find(store => store.slug === storeSlug);
  const write = value => { save(state); return value; };
  if(route === '/api/session') return {account:user || null};
  if(route === '/api/logout') { sessionStorage.removeItem('tapstore-demo-role');sessionStorage.removeItem('tapstore-demo-email');return {ok:true}; }
  if(route === '/api/login' || route.startsWith('/api/register')) {
    const loginRole = data.role || (route.endsWith('/buyer') ? 'buyer' : 'owner');
    sessionStorage.setItem('tapstore-demo-role',loginRole);
    sessionStorage.removeItem('tapstore-demo-email');
    return {ok:true,role:loginRole};
  }
  const shop=route.match(/^\/api\/shops\/([a-z0-9-]+)(\/requests)?$/);
  if(shop) {
    const currentStore=state.stores.find(store => store.slug === shop[1] && store.published);
    if(!currentStore) fail('Витрина не опубликована',404);
    const products=state.products.filter(product => product.slug === shop[1] && product.active && !product.archived);
    if(!data) return {store:currentStore,products:products.map(product => ({...product,price:salePrice(product),original_price:product.price}))};
    const existing=state.requests.find(order => order.key === data.key);
    if(existing) return {id:existing.id,key:existing.key};
    const fulfillment=data.fulfillment || 'pickup';
    if(!['pickup','delivery'].includes(fulfillment) || (fulfillment==='delivery' && !currentStore.delivery_enabled))fail('Доставка не подключена');
    if(fulfillment==='delivery' && (!safe(data.contact) || !safe(data.deliveryAddress)))fail('Укажите контакт и адрес доставки');
    if(!Array.isArray(data.items) || !data.items.length || !safe(data.name))fail('Укажите имя и добавьте товары');
    const items=data.items.map(item => {
      const product=products.find(product => product.id === item.id);
      if(!product || !product.in_stock || item.price !== salePrice(product)) fail('Цена или наличие изменились. Обновите витрину.',409);
      if(!Number.isInteger(item.qty)||item.qty<1||item.qty>20)fail('Проверьте количество');
      const options=(product.variants||'').split('|').filter(Boolean),variant=safe(item.variant).slice(0,60);
      if(options.length && !options.includes(variant))fail('Выберите вариант товара');
      return {name:product.name+(variant?' · '+variant:''),variant,price:salePrice(product),qty:item.qty};
    });
    const order={id:state.nextOrder++,key:data.key,slug:shop[1],name:data.name,fulfillment,contact:safe(data.contact).slice(0,120),delivery_address:safe(data.deliveryAddress).slice(0,240),comment:safe(data.comment).slice(0,500),status:'new',created:new Date().toISOString(),items,total:items.reduce((total,item) => total+item.price*item.qty,0),buyer_email:user?.role === 'buyer' ? user.email : null};
    state.requests.push(order);return write({id:order.id,key:order.key});
  }
  const track=route.match(/^\/api\/track\/([a-f0-9]+)$/);
  if(track) {
    const order=state.requests.find(order => order.key === track[1]);
    if(!order) fail('Заявка не найдена',404);
    const store=state.stores.find(store => store.slug === order.slug);
    return {...order,store:store.name,address:store.address};
  }
  if(!user) fail('Выберите роль в панели демо',401);
  if(route === '/api/buyer') return {account:user,stores:state.stores.filter(store => store.published),requests:state.requests.filter(order => order.buyer_email === user.email).map(order => ({...order,store:state.stores.find(store => store.slug === order.slug).name}))};
  if(!['owner','seller'].includes(user.role)) fail('Войдите как владелец или сотрудник',403);
  if(user.role === 'seller' && storeSlug !== user.slug) fail('Нет доступа к магазину',403);
  if(route === '/api/manage/stores') {
    if(user.role !== 'owner') fail('Доступно владельцу',403);
    if(state.stores.some(store => store.slug === data.slug)) fail('Этот адрес занят');
    state.stores.push({slug:data.slug,name:data.name,address:'',published:0});return write({slug:data.slug});
  }
  if(!store) fail('Магазин не найден',404);
  const products=state.products.filter(product => product.slug === storeSlug && !product.archived);
  const orders=state.requests.filter(order => order.slug === storeSlug);
  if(route === '/api/manage') return {account:user,store,stores:state.stores,products,requests:orders.slice().reverse(),staff:user.role === 'owner' ? state.accounts.filter(account => account.role === 'seller' && account.slug === storeSlug) : []};
  const status=route.match(/^\/api\/manage\/requests\/(\d+)$/);
  if(status) {
    const order=orders.find(order => order.id === Number(status[1]));
    if(!order || order.status !== data.previous) fail('Обновите список заявок',409);
    order.staff_note=safe(data.note).slice(0,500);order.status=data.status;if(data.status === 'completed') order.completed_at=new Date().toISOString();
    return write({ok:true});
  }
  const photo=route.match(/^\/api\/manage\/photos\/(\d+)$/);
  if(photo) {
    const product=products.find(product => product.id === Number(photo[1]));
    if(!product) fail('Товар не найден',404);
    if(data.image && data.image.length>2800000) fail('Фото должно быть не больше 2 МБ');
    product.photo=data.image ? 'data:image/'+(data.image.startsWith('iVBOR') ? 'png' : data.image.startsWith('/9j/') ? 'jpeg' : 'webp')+';base64,'+data.image : '';
    product.has_photo=Number(!!product.photo);return write({ok:true});
  }
  if(route === '/api/manage/products/remove') {
    const product=products.find(product => product.id === data.id);if(!product) fail('Товар не найден',404);
    product.archived=1;product.active=0;return write({ok:true});
  }
  if(route === '/api/manage/products') {
    let product=products.find(product => product.id === data.id);
    const creating=data.id === null;
    if(!creating && !product) fail('Товар не найден',404);
    if(!data.name || !data.allowed) fail('Заполните название и подтвердите категорию');
    if(creating || user.role === 'owner' || user.can_edit_prices) {
      if(!Number.isInteger(data.price) || data.price<1 || data.price>100000 || data.discount<0 || data.discount>99) fail('Проверьте цену и скидку');
    }
    if(creating) {product={id:state.nextProduct++,slug:storeSlug};state.products.push(product);}
    const variants=safe(data.variants).split('|').map(v=>v.trim()).filter(Boolean);if(variants.length>12||variants.some(v=>v.length>60)||new Set(variants).size!==variants.length)fail('До 12 уникальных вариантов, каждый до 60 символов');
    Object.assign(product,{variants:variants.join('|'),name:data.name,active:Number(data.active),in_stock:Number(data.inStock)});
    if(creating || user.role === 'owner' || user.can_edit_prices) Object.assign(product,{price:data.price,discount:data.discount || 0});
    return write({ok:true,id:product.id});
  }
  if(user.role !== 'owner') fail('Доступно владельцу',403);
  if(route === '/api/manage/store') {if(data.published && !data.address) fail('Укажите адрес самовывоза');Object.assign(store,{name:data.name,address:data.address,description:safe(data.description).slice(0,600),contact:safe(data.contact).slice(0,120),hours:safe(data.hours).slice(0,180),template:['sky','lavender'].includes(data.template)?data.template:'sky',delivery_enabled:Number(data.deliveryEnabled===true),published:Number(data.published)});return write({ok:true});}
  if(route === '/api/manage/staff') {
    if(state.accounts.some(account => account.email === data.email)) fail('Эта почта уже используется');
    state.accounts.push({email:data.email,role:'seller',slug:storeSlug,enabled:1,can_edit_prices:Number(data.canEditPrices)});return write({ok:true});
  }
  if(route === '/api/manage/staff/update') {
    const employee=state.accounts.find(account => account.email === data.email && account.slug === storeSlug && account.role === 'seller');
    if(!employee) fail('Сотрудник не найден',404);Object.assign(employee,{enabled:Number(data.enabled),can_edit_prices:Number(data.canEditPrices)});return write({ok:true});
  }
  if(route === '/api/manage/ledger') {
    const existing=state.entries.find(entry => entry.key === data.key);if(existing)return {id:existing.id};
    const entry={...data,id:state.nextEntry++,slug:storeSlug};state.entries.push(entry);return write({ok:true,id:entry.id});
  }
  if(route === '/api/manage/ledger/remove') {
    state.entries=state.entries.filter(entry => entry.id !== data.id || entry.slug !== storeSlug);return write({ok:true});
  }
  if(route === '/api/manage/analytics') {
    const since=Date.now()-Number(url.searchParams.get('days') || 7)*86400000;
    const selected=orders.filter(order => Date.parse(order.created)>=since),completed=selected.filter(order => order.status === 'completed');
    const amount=completed.reduce((total,order) => total+order.total,0);
    return {received:selected.length,completed:completed.length,cancelled:selected.filter(order => order.status === 'cancelled').length,amount,average:completed.length ? amount/completed.length : 0};
  }
  if(route === '/api/manage/report') {
    const from=url.searchParams.get('from'),to=url.searchParams.get('to');
    if(!from || !to || from>to) fail('Выберите период');
    const dateOf = value => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow'}).format(new Date(value));
    const within = date => date>=from && date<=to;
    const sales=orders.filter(order => order.status === 'completed' && within(dateOf(order.completed_at || order.created)));
    const entries=state.entries.filter(entry => entry.slug === storeSlug && within(entry.date));
    const salesAmount=sales.reduce((n,order) => n+order.total*100,0);
    const otherIncome=entries.filter(entry => entry.kind === 'income').reduce((n,entry) => n+entry.amount,0);
    const expenses=entries.filter(entry => entry.kind === 'expense').reduce((n,entry) => n+entry.amount,0);
    const daily=Object.create(null),categories=Object.create(null),top=Object.create(null);
    for(const sale of sales) {
      const date=dateOf(sale.completed_at || sale.created);daily[date] ??= {income:0,expenses:0};daily[date].income+=sale.total*100;
      for(const item of sale.items) {top[item.name] ??= {name:item.name,qty:0,amount:0};top[item.name].qty+=item.qty;top[item.name].amount+=item.price*item.qty*100;}
    }
    for(const entry of entries) {
      daily[entry.date] ??= {income:0,expenses:0};daily[entry.date][entry.kind === 'income' ? 'income' : 'expenses']+=entry.amount;
      if(entry.kind === 'expense') categories[entry.category]=(categories[entry.category] || 0)+entry.amount;
    }
    return {salesAmount,otherIncome,expenses,income:salesAmount+otherIncome,balance:salesAmount+otherIncome-expenses,salesCount:sales.length,average:sales.length ? salesAmount/sales.length : 0,estimatedSales:0,
      requests:{received:orders.filter(order => within(dateOf(order.created))).length,cancelled:orders.filter(order => order.status === 'cancelled' && within(dateOf(order.created))).length},entries,
      daily:Object.keys(daily).sort().map(date => ({date,...daily[date]})),categories:Object.keys(categories).map(name => ({name,amount:categories[name]})),products:Object.values(top).sort((a,b) => b.amount-a.amount).slice(0,20)};
  }
  fail('Действие не найдено',404);
}

export function setupDemo() {
  read();
  if(!sessionStorage.getItem('tapstore-demo-role')) sessionStorage.setItem('tapstore-demo-role','buyer');
  const panel=document.createElement('section');panel.className='panel demo-controls';
  panel.innerHTML='<div><strong>Рабочее демо TapStore</strong><p>Тестовые данные сохраняются в этом браузере. Выберите роль и пройдите путь от заявки до выдачи.</p></div><div class="row"><div id="demo-roles" class="row"></div><button id="reset-demo" class="secondary">Сбросить демо</button></div>';
  for(const [role,label] of Object.entries(roles)) {
    const button=document.createElement('button');button.textContent=label;button.type='button';
    button.className=sessionStorage.getItem('tapstore-demo-role') === role ? '' : 'secondary';
    button.addEventListener('click',() => {sessionStorage.setItem('tapstore-demo-role',role);sessionStorage.removeItem('tapstore-demo-email');navigateDemo('/'+(role === 'buyer' ? 'shop/demo' : 'manage'));});
    panel.querySelector('#demo-roles').append(button);
  }
  const resetButton = panel.querySelector('#reset-demo');
  let resetConfirmed = false;
  resetButton.addEventListener('click',() => {
    if(!resetConfirmed) {
      resetConfirmed = true;
      resetButton.textContent = 'Подтвердить сброс демо';
      return;
    }
    save(seed());navigateDemo('/shop/demo');
  });
  document.querySelector('main').prepend(panel);
  window.addEventListener('hashchange',() => location.reload());
  new MutationObserver(() => {
    for(const link of document.querySelectorAll('a[href^="/"]')) {
      const href=link.getAttribute('href');
      if(!href.startsWith(DEMO_BASE)) link.setAttribute('href',DEMO_BASE+'#'+href);
    }
    for(const image of document.querySelectorAll('img[src^="/api/"]')) {
      const id=Number(image.getAttribute('src').split('?')[0].split('/').pop());
      const product=read().products.find(product => product.id === id);
      if(product?.photo) image.src=product.photo;
    }
    for(const input of document.querySelectorAll('input[type="password"]')) input.placeholder='Демо — любой пароль от 12 символов';
  }).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('submit',event => {
    const form=event.target;
    if(form.getAttribute('action') === '/manage') {
      event.preventDefault();navigateDemo('/manage?'+new URLSearchParams(new FormData(form)));
    }
  },true);
}
