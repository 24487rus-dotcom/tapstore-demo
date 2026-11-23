const DEMO_BASE = new URL('.',import.meta.url).pathname;
function demoNavigate(url) { const target = new URL(location.href); target.hash = url; if (target.href === location.href) location.reload(); else location.href = target.href; }
import {displayMoney,demoLocale,translate,setupI18n} from './i18n.js';
import {demoApi,setupDemo} from './state.js';
setupDemo();
setupI18n();
const page = document.querySelector('#page');
const notice = document.querySelector('#notice');
const escape = value => String(value ?? '').replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = displayMoney;
const labels = {new:'Новая',accepted:'В сборке',ready:'Готова к выдаче',completed:'Выдана',cancelled:'Отменена'};
const steps = {new:['accepted','Принять'],accepted:['ready','Готово к выдаче'],ready:['completed','Подтвердить выдачу']};
const roles = {owner:'Владелец',seller:'Сотрудник',buyer:'Покупатель'};
const cabinet = role => role === 'buyer' ? '/buyer' : '/manage';
const path = (location.hash.slice(1).split('?')[0] || '/').replace(/\/$/,'') || '/';
const fields = form => Object.fromEntries(new FormData(form));
const list = items => items.map(item => `<li>${escape(item.name)} × ${item.qty}</li>`).join('');
const cart = new Map();
const selectedVariants = new Map();
const connection = document.createElement('div');
connection.className = 'connection-banner';
connection.setAttribute('role','status');
document.querySelector('main').prepend(connection);
function updateConnection() {
  connection.hidden = navigator.onLine;
  connection.textContent = 'Нет соединения. Показаны последние загруженные данные. Изменения не отправлены: подключитесь и повторите действие.';
}
window.addEventListener('online',updateConnection);
window.addEventListener('offline',updateConnection);
updateConnection();
let catalog = [];
let stopUpdates = () => {};
function autoUpdate(update) {
  stopUpdates();
  let busy = false;
  const run = async () => {
    if (busy || document.hidden) return;
    busy = true;
    try { await update(); } finally { busy = false; }
  };
  const timer = setInterval(run,5000);
  document.addEventListener('visibilitychange',run);
  stopUpdates = () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange',run);
  };
}
window.addEventListener('pagehide',() => stopUpdates());

async function api(url,data) { return demoApi(url,data); }

function handle(form, action) {
  form.addEventListener('submit',async event => {
    event.preventDefault();
    const button = event.submitter;
    if (form.dataset.busy) return;
    form.dataset.busy = 'true';
    if (button) button.disabled = true;
    notice.textContent = '';
    try { await action(fields(form),button); }
    catch (error) { notice.textContent = error.name === 'TimeoutError' ? 'Сервер не ответил. Проверьте соединение и повторите действие.' : error.message || 'Ошибка соединения'; }
    finally { delete form.dataset.busy; if (button) button.disabled = false; }
  });
}
function credentials(autocomplete) {
  return `<label>Электронная почта<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
    <label>Пароль<input name="password" type="password" autocomplete="${autocomplete}" minlength="12" maxlength="128" required></label>`;
}
function welcome(defaultRole = 'owner') {
  const requested = new URLSearchParams((location.hash.includes('?') ? '?'+location.hash.split('?')[1] : '')).get('role');
  const role = Object.hasOwn(roles,requested) ? requested : defaultRole;
  const loginTitle = {owner:'Войти как владелец',seller:'Войти как сотрудник',buyer:'Войти как покупатель'}[role];
  const registerTitle = role === 'owner' ? 'Регистрация владельца' : 'Регистрация покупателя';
  const registerHelp = role === 'owner'
    ? 'Создать магазин можно в кабинете после регистрации.'
    : 'Заявки, оформленные после входа, появятся в вашем кабинете.';
  const loginHelp = role === 'seller' ? 'Почту и пароль для входа выдаёт владелец магазина.' : '';
  page.innerHTML = `<section class="hero welcome-hero"><div><span class="eyebrow">TAPSTORE ДЛЯ НЕБОЛЬШОГО БИЗНЕСА</span><h1>Ваш бизнес онлайн.<br>Всё под рукой.</h1><p>Витрина, товары и заявки в одном понятном кабинете. Больше внимания покупателям, меньше повседневной рутины.</p><div class="hero-actions"><a class="button" href="#auth">Войти в кабинет</a><a class="button secondary" href="/shop/demo">Посмотреть витрину</a></div></div><div class="workspace-preview"><div class="preview-bar">Обзор магазина <span class="muted">Пример интерфейса</span></div><div class="preview-values"><div><small>Заявки за неделю</small><strong>24</strong></div><div><small>Выдано заказов</small><strong>18</strong></div></div><svg class="preview-chart" viewBox="0 0 400 100" role="img" aria-label="Иллюстрация графика заявок"><path d="M0 85H400 M0 45H400 M0 5H400" stroke="#e5ebf9" fill="none"/><path d="M0 88 C40 88 40 45 80 58 S130 80 160 45 S205 60 240 25 S300 50 330 18 S375 30 400 5" stroke="#5685ec" stroke-width="3" fill="none"/></svg><div class="preview-order">Заявка № 24 <span>К выдаче</span></div><div class="preview-order">Заявка № 23 <span>Выдана</span></div><div class="preview-caption">Иллюстративные данные, не показатели реального бизнеса</div></div></section>
    <section class="panel auth-panel" aria-labelledby="auth-title">
    <nav class="manage-nav" aria-label="Роль при входе и регистрации">${Object.entries(roles).map(([id,label]) =>
      `<a href="/?role=${id}"${id === role ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    ${role !== 'seller' ? `<div class="auth-modes" role="group" aria-label="Вход или регистрация">
      <button type="button" data-mode="login" aria-pressed="true">Вход</button>
      <button type="button" data-mode="register" aria-pressed="false">Регистрация</button>
    </div>` : ''}
    <h2 id="auth-title">${loginTitle}</h2>
    <p id="auth-help" class="muted"${loginHelp ? '' : ' hidden'}>${loginHelp}</p>
    <form id="auth">${credentials('current-password')}<button type="submit">Войти</button></form></section>`;
  const form = document.querySelector('#auth');
  const password = form.elements.namedItem('password');
  const submit = form.querySelector('button');
  const switches = document.querySelectorAll('[data-mode]');
  let registering = false;
  for (const control of switches) control.addEventListener('click',() => {
    const next = control.dataset.mode === 'register';
    if (form.dataset.busy || next === registering) return;
    registering = next;
    for (const option of switches) option.setAttribute('aria-pressed',String(option === control));
    document.querySelector('#auth-title').textContent = registering ? registerTitle : loginTitle;
    const help = document.querySelector('#auth-help');
    help.textContent = registering ? registerHelp : loginHelp;
    help.hidden = !help.textContent;
    password.value = '';
    password.autocomplete = registering ? 'new-password' : 'current-password';
    submit.textContent = registering ? 'Зарегистрироваться' : 'Войти';
    notice.textContent = '';
  });
  handle(form,async data => {
    if (registering) {
      await api(role === 'buyer' ? '/api/register/buyer' : '/api/register',data);
      demoNavigate(cabinet(role));
    } else {
      const session = await api('/api/login',{...data,role});
      demoNavigate(cabinet(session.role));
    }
  });
}
function bindLogout(role) {
  handle(document.querySelector('#logout'),async () => {
    await api('/api/logout',{});
    demoNavigate('/?role='+role);
  });
}
async function buyer() {
  const {account,stores,requests} = await api('/api/buyer');
  page.innerHTML = `<section class="hero manage-hero"><p>Кабинет покупателя</p><h1>Самовывоз</h1>
    <div class="row"><span>${escape(account.email)}</span><form id="logout"><button class="secondary">Выйти</button></form></div></section>
    <div class="columns"><section><div class="row manage-title"><h2>Мои заявки</h2><a class="button secondary" href="/buyer">Обновить</a></div>
    ${requests.map(order => `<article class="panel"><div class="row"><h3>Заявка № ${order.id}</h3><span class="pill">${labels[order.status]}</span></div>
      <p>${escape(order.store)} · ${escape(order.address)}</p><ul>${list(order.items)}</ul><b>${money(order.total)}</b></article>`).join('') || '<p>У вас пока нет заявок.</p>'}
    </section><section><h2>Витрины магазинов</h2>
    ${stores.map(store => `<article class="panel"><h3><a href="/shop/${store.slug}">${escape(store.name)}</a></h3><p class="muted">${escape(store.address)}</p></article>`).join('') || '<p>Пока нет опубликованных витрин.</p>'}</section></div>`;
  bindLogout('buyer');
}
function renderRequests(requests) {
  return requests.map(order => {
    const step = steps[order.status];
    return `<article class="panel request-card"><div class="row"><h3>Заявка № ${order.id}</h3><span class="pill status-${escape(order.status)}">${labels[order.status]}</span></div>
      <p class="request-meta">${escape(order.name)} · ${escape(new Date(order.created).toLocaleString(demoLocale))}</p>
      <div class="order-context"><b>${order.fulfillment==='delivery'?'Запрос доставки':'Самовывоз'}</b>${order.contact?'<p>Контакт: '+escape(order.contact)+'</p>':''}${order.delivery_address?'<p>Адрес: '+escape(order.delivery_address)+'</p>':''}${order.comment?'<p>Покупатель: '+escape(order.comment)+'</p>':''}${order.staff_note?'<p>Ответ магазина: '+escape(order.staff_note)+'</p>':''}</div><ul>${list(order.items)}</ul><p class="request-total"><b>${money(order.total)}</b></p>
      ${step ? `<form class="row" data-request="${order.id}" data-status="${order.status}"><label class="order-note">Комментарий покупателю<input name="note" maxlength="500" value="${escape(order.staff_note || '')}"></label><button name="status" value="${step[0]}">${step[1]}</button><button class="secondary" name="status" value="cancelled">Отменить</button></form>` : ''}</article>`;
  }).join('') || '<div class="empty-state"><h3>Здесь пока спокойно</h3><p>В этом статусе нет заявок. Новые появятся автоматически.</p></div>';
}
function photoBase64(file) {
  if (!file?.size) throw new Error('Выберите фотографию');
  if (file.size > 2 * 1024 * 1024) throw new Error('Фотография должна быть не больше 2 МБ');
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Не удалось прочитать фотографию'));
    reader.readAsDataURL(file);
  });
}
function productForm(product = {name:'',price:'',active:1}, photoLink = '', canEditPrice = true) {
  return `<form class="product-form line" data-id="${product.id ?? ''}">
    <label>Название<input name="name" value="${escape(product.name)}" maxlength="80" required></label>
    <label>Варианты товара<input name="variants" value="${escape(product.variants || '')}" maxlength="731" placeholder="Маленький | Большой"></label><p class="muted">Разделитель — вертикальная черта. До 12 вариантов с общей ценой и наличием. Для разных цен создайте отдельные карточки.</p>
    <label>Цена, ₽<input name="price" type="number" min="1" max="100000" value="${product.price}" ${canEditPrice ? 'required' : 'readonly'}></label>
    <label>Скидка, %<input name="discount" type="number" min="0" max="99" step="1" value="${product.discount ?? 0}" ${canEditPrice ? 'required' : 'readonly'}></label>
    ${canEditPrice ? '' : '<p class="muted">Для изменения цены и скидки владелец должен включить вам разрешение во вкладке «Сотрудники».</p>'}
    <p class="muted">0 — без скидки. Цена со скидкой округляется до целого рубля, минимум 1 ₽.</p>
    <label><input type="checkbox" name="inStock" ${product.in_stock !== 0 ? 'checked' : ''}> В наличии</label>
    <label><input name="active" type="checkbox" ${product.active ? 'checked' : ''}> Показывать на витрине</label>
    <label><input name="allowed" type="checkbox" ${product.id ? 'checked' : ''} required> Товар из ассортимента пилота: закуски, безалкогольные напитки или аксессуары</label>
    ${product.has_photo ? `<img class="product-photo" src="${escape(photoLink)}" alt="" loading="lazy">` : ''}
    <label>Фото карточки<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
    <p class="muted">JPG, PNG или WebP, до 2 МБ. Фото сохранится вместе с товаром.</p>
    ${product.has_photo ? '<label><input type="checkbox" name="removePhoto"> Удалить текущее фото</label>' : ''}
    <div class="row"><button class="secondary">${product.id ? 'Сохранить товар' : 'Добавить товар'}</button>
    ${product.id ? `
    <button class="secondary danger" value="remove" formnovalidate>Удалить товар</button>` : ''}</div></form>`;
}
async function manage() {
  stopUpdates();
  const params = new URLSearchParams((location.hash.includes('?') ? '?'+location.hash.split('?')[1] : ''));
  const selectedStore = params.get('store');
  const storeQuery = selectedStore === null ? '' : '?' + new URLSearchParams({store:selectedStore});
  let data;
  try { data = await api('/api/manage'+storeQuery); }
  catch (error) { if (error.status === 401) return welcome(); throw error; }
  const {account,store,stores,products,requests,staff:employees = []} = data;
  const owner = account.role === 'owner';
  if (owner && (!store || params.get('section') === 'create')) {
    page.innerHTML = `<section class="hero manage-hero"><p>Кабинет владельца</p><h1>Создать магазин</h1>
      <div class="row"><span>${escape(account.email)}</span><form id="logout"><button class="secondary">Выйти</button></form></div></section>
      <form id="create-store" class="panel manage-settings">
        <label>Название магазина<input name="name" maxlength="80" required autofocus></label>
        <label>Адрес витрины<input name="slug" minlength="3" maxlength="40" pattern="[a-z0-9][a-z0-9\\-]{2,39}" placeholder="my-shop" required aria-describedby="slug-help"></label>
        <p id="slug-help" class="muted">От 3 до 40 символов: строчные латинские буквы, цифры и дефис. Например, my-shop.</p>
        <div class="row"><button>Создать магазин</button>${store ? `<a href="/manage${storeQuery}">Вернуться в кабинет</a>` : ''}</div>
      </form>`;
    bindLogout(account.role);
    handle(document.querySelector('#create-store'),async fields => {
      const {slug} = await api('/api/manage/stores',fields);
      demoNavigate('/manage?' + new URLSearchParams({store:slug,section:'storefront'}));
    });
    return;
  }
  const sections = owner
    ? {requests:'Заявки',catalog:'Каталог',photos:'Фото товаров',analytics:'Аналитика',storefront:'Витрина',staff:'Сотрудники'}
    : {requests:'Заявки',catalog:'Каталог',photos:'Фото товаров'};
  const requestedSection = params.get('section');
  const activeSection = Object.hasOwn(sections, requestedSection) ? requestedSection : 'requests';
  const manageLink = section => '/manage?' + new URLSearchParams({store:store.slug,section});
  const storeApi = suffix => '/api/manage'+suffix+'?'+new URLSearchParams({store:store.slug});
  const launchSteps = [
    {label:'Добавить первый товар',done:products.some(product => product.active),section:'catalog'},
    {label:'Указать адрес самовывоза',done:!!store.address.trim(),section:'storefront'},
    {label:'Опубликовать витрину',done:!!store.published,section:'storefront'}
  ];
  const navSymbols = {requests:'▤',catalog:'▦',photos:'▧',analytics:'◷',storefront:'▣',staff:'♧'};
  page.innerHTML = `<div class="manage-shell"><aside class="manage-sidebar"><div class="workspace-label">TAPSTORE / ${owner ? 'Владелец' : 'Сотрудник'}</div><nav class="manage-nav" aria-label="Разделы кабинета">${Object.entries(sections).map(([section,label]) => `<a href="${escape(manageLink(section))}"${activeSection === section ? ' aria-current="page"' : ''}><span class="nav-symbol" aria-hidden="true">${navSymbols[section]}</span>${label}</a>`).join('')}</nav></aside><div class="workspace-content"><section class="hero manage-hero"><p>${owner ? 'Кабинет владельца' : 'Кабинет продавца'}</p><h1>${escape(store.name)}</h1>
    <div class="row"><span>${escape(account.email)}</span><form id="logout"><button class="secondary">Выйти</button></form></div></section>
    ${owner ? `<div class="row store-switcher">
      ${stores.length > 1 ? `<form class="row" action="/manage"><input type="hidden" name="section" value="${activeSection}"><label>Магазин<select name="store" aria-label="Магазин">
        ${stores.map(item => `<option value="${escape(item.slug)}"${item.slug === store.slug ? ' selected' : ''}>${escape(item.name)}</option>`).join('')}
      </select></label><button class="secondary">Открыть</button></form>` : ''}
      <a class="button secondary" href="${escape(manageLink('create'))}">Создать магазин</a>
    </div>` : ''}
    ${owner && !launchSteps.every(step => step.done) ? `<section class="panel launch-guide"><h2>Запуск магазина</h2>
      <p class="muted">Готово ${launchSteps.filter(step => step.done).length} из 3 шагов.</p>
      <ol>${launchSteps.map(step => `<li><a href="${escape(manageLink(step.section))}">${step.done ? '✓ ' : ''}${step.label}</a>${step.done ? ' — готово' : ''}</li>`).join('')}</ol>
      <p class="muted">Добавьте хотя бы один товар, видимый на витрине.</p></section>` : ''}
    ${owner && store.published ? `<div class="panel row"><a href="/shop/${store.slug}" target="_blank" rel="noopener">Открыть витрину ↗</a>
      <button id="copy-store-link" class="secondary" type="button">Скопировать ссылку</button><p id="copy-feedback" role="status" class="muted"></p></div>` : ''}
    ${activeSection === 'requests' ? `<section><div class="row manage-title"><h2>Заявки</h2><button id="refresh" class="secondary">Обновить</button></div>
    <p id="order-sync" class="sync-line" role="status">Автообновление каждые 5 секунд.</p>
    <div class="order-summary" id="order-summary"></div>
    <div id="order-filters" class="manage-nav" role="group" aria-label="Статусы заявок"></div>
    <div id="requests"></div></section>` : ''}
    ${activeSection === 'storefront' ? `<form id="settings" class="panel manage-settings"><h2>Витрина</h2>
      <label>Название<input name="name" value="${escape(store.name)}" maxlength="80" required></label>
      <label>Описание бизнеса<textarea name="description" maxlength="600" rows="4">${escape(store.description || '')}</textarea></label><label>Контакты<input name="contact" value="${escape(store.contact || '')}" maxlength="120"></label><label>Часы работы<input name="hours" value="${escape(store.hours || '')}" maxlength="180" placeholder="Пн–Вс 10:00–22:00"></label><label>Шаблон сайта<select name="template"><option value="sky">Голубой · Небо</option><option value="lavender" ${store.template==='lavender'?'selected':''}>Лавандовый · Студия</option></select></label><label><input type="checkbox" name="deliveryEnabled" ${store.delivery_enabled?'checked':''}> Принимать запросы доставки</label><p class="muted">Стоимость и время доставки согласовываются с покупателем. Курьерские службы не подключены.</p><label>Адрес самовывоза<input name="address" maxlength="180" value="${escape(store.address)}"></label>
      <label><input name="published" type="checkbox" ${store.published ? 'checked' : ''}> Опубликовать витрину</label>
      <div class="row"><button>Сохранить</button>${store.published ? `<a href="/shop/${store.slug}">Открыть витрину ↗</a>` : ''}</div></form>` : ''}
    ${activeSection === 'catalog' ? `<section class="panel"><h2>Каталог</h2><details><summary>Добавить товар</summary>${productForm()}</details>
      ${products.map(product => `<details class="line"><summary>${escape(product.name)} · ${money(product.price)}${product.discount ? ' · скидка '+product.discount+'%' : ''}${product.in_stock ? '' : ' · нет в наличии'}${product.active ? '' : ' · скрыт'}</summary>
        ${productForm(product,storeApi('/photos/'+product.id),owner || account.can_edit_prices === 1)}</details>`).join('')}</section>` : ''}
    ${activeSection === 'photos' ? `<section><h2>Фото товаров</h2><p class="muted">JPG, PNG или WebP, до 2 МБ на товар.</p>
      <div class="grid">${products.map(product => `<form class="panel" id="photo-${product.id}" data-photo="${product.id}">
        ${product.has_photo ? `<img class="product-photo" src="${escape(storeApi('/photos/'+product.id))}" alt="" loading="lazy">` : ''}
        <h3>${escape(product.name)}</h3>
        ${product.active ? '' : '<p class="muted">Товар скрыт с витрины.</p>'}
        <label>Выбрать фото<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
        <div class="row"><button value="save">${product.has_photo ? 'Заменить фото' : 'Загрузить фото'}</button>
        ${product.has_photo ? '<button class="secondary" value="remove">Удалить фото</button>' : ''}</div>
      </form>`).join('') || '<p>В каталоге пока нет товаров.</p>'}</div></section>` : ''}
    ${activeSection === 'analytics' ? `<section class="panel"><h2>Аналитика</h2>
      <label>Период<select id="analytics-period"><option value="1">Последние 24 часа</option><option value="7" selected>Последние 7 дней</option><option value="30">Последние 30 дней</option></select></label>
      <p class="muted">Заявки, созданные за выбранный период, по их текущему статусу. Сумма и средний чек рассчитаны по выданным заявкам.</p>
      <div id="analytics-result" class="grid" role="status"></div></section>
      <section class="panel"><h2>Финансовый отчёт — ${escape(store.name)}</h2>
        <form id="report-period" class="row"><label>С даты<input type="date" name="from" required></label><label>По дату<input type="date" name="to" required></label><button>Показать отчёт</button></form>
        <p class="muted">Даты по Москве. Выручка учитывается при выдаче заявки. Внесите закупки, аренду, зарплаты, налоги и другие расходы вручную. Итог показывает разницу учтённых доходов и расходов.</p>
        <div id="financial-report" aria-live="polite"></div>
      </section><form id="ledger-entry" class="panel"><h2>Добавить доход или расход</h2>
        <p class="muted">Выданные заявки TapStore уже включены в доход. Здесь добавляйте только другие доходы и расходы.</p>
        <div class="columns"><label>Тип<select name="kind"><option value="expense">Расход</option><option value="income">Другой доход</option></select></label>
        <label>Дата<input type="date" name="date" required></label>
        <label>Сумма, ₽<input name="amount" type="number" min="0.01" max="100000000" step="0.01" required></label>
        <label>Категория<input name="category" maxlength="60" list="ledger-categories" required></label></div>
        <datalist id="ledger-categories"><option value="Закупки"><option value="Аренда"><option value="Зарплаты"><option value="Налоги"><option value="Реклама"><option value="Прочее"></datalist>
        <label>Комментарий<input name="note" maxlength="300"></label><button>Добавить операцию</button>
        <p id="ledger-feedback" role="status"></p></form>` : ''}
    ${activeSection === 'staff' ? `<section><h2>Сотрудники</h2>
      ${employees.map(employee => `<form class="panel staff-access" data-email="${escape(employee.email)}"><div class="row">
        <h3>${escape(employee.email)}</h3><span class="pill">${employee.enabled ? 'Доступ открыт' : 'Доступ отключён'}</span></div>
        <label><input type="checkbox" name="enabled" ${employee.enabled ? 'checked' : ''}> Разрешить вход и работу в магазине</label>
        <label><input type="checkbox" name="canEditPrices" ${employee.can_edit_prices ? 'checked' : ''}> Разрешить менять цены товаров</label>
        <button class="secondary">Сохранить доступ</button></form>`).join('') || '<p class="muted">Сотрудники пока не добавлены.</p>'}
      <form id="staff" class="panel manage-settings"><h2>Добавить сотрудника</h2>${credentials('new-password')}
        <label><input type="checkbox" name="canEditPrices"> Разрешить менять цены товаров</label>
        <button>Создать учётную запись</button></form></section>` : ''}</div></div>`;
  bindLogout(account.role);
  if (activeSection === 'analytics') {
    const period = document.querySelector('#analytics-period');
    const result = document.querySelector('#analytics-result');
    let requestId = 0;
    async function loadAnalytics() {
      const current = ++requestId;
      result.textContent = 'Загружаем…';
      try {
        const stats = await api(storeApi('/analytics')+'&days='+period.value);
        if (current !== requestId) return;
        result.innerHTML = [
          ['Поступило заявок',stats.received],['Выдано',stats.completed],['Отменено',stats.cancelled],
          ['Сумма выданных заявок',money(stats.amount)],['Средний чек',money(stats.average)]
        ].map(([label,value]) => `<div class="panel"><p class="muted">${label}</p><strong>${value}</strong></div>`).join('');
      } catch (error) {
        if (current === requestId) result.textContent = 'Не удалось загрузить аналитику. '+error.message;
      }
    }
    period.addEventListener('change',loadAnalytics);
    await loadAnalytics();
    const reportForm = document.querySelector('#report-period');
    const ledgerForm = document.querySelector('#ledger-entry');
    const report = document.querySelector('#financial-report');
    const moscowDate = date => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
    reportForm.elements.from.value = moscowDate(new Date(Date.now()-29*86400000));
    reportForm.elements.to.value = moscowDate(new Date());
    ledgerForm.elements.date.value = moscowDate(new Date());
    const rubles = cents => displayMoney(cents/100);
    let reportRequest = 0;
    function table(headers,rows) {
      return rows.length ? `<div class="table-scroll"><table><thead><tr>${headers.map(text => `<th>${escape(text)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">За этот период данных нет.</p>';
    }
    async function loadReport() {
      const current = ++reportRequest;
      report.textContent = 'Загружаем отчёт…';
      const range = new URLSearchParams(fields(reportForm));
      try {
        const stats = await api(storeApi('/report')+'&'+range);
        if (current !== reportRequest) return;
        report.innerHTML = `<div class="grid">${[
          ['Выручка TapStore',rubles(stats.salesAmount)],['Другие доходы',rubles(stats.otherIncome)],
          ['Всего доходов',rubles(stats.income)],['Расходы',rubles(stats.expenses)],
          ['Итог за период',rubles(stats.balance)],['Средний чек выданных заявок',rubles(stats.average)],
          ['Поступило заявок',stats.requests.received],['Выдано за период',stats.salesCount],['Отменено из поступивших',stats.requests.cancelled]
        ].map(([label,value]) => `<div class="panel"><p class="muted">${label}</p><strong>${value}</strong></div>`).join('')}</div>
        ${stats.estimatedSales ? `<p class="muted">У ${stats.estimatedSales} старых выданных заявок дата выдачи не сохранена. Для них использована дата создания.</p>` : ''}
        <h3>Доходы и расходы по дням</h3>${table(['Дата','Доходы','Расходы','Итог'],stats.daily.map(day => [day.date,rubles(day.income),rubles(day.expenses),rubles(day.income-day.expenses)]))}
        <h3>Расходы по категориям</h3>${table(['Категория','Сумма'],stats.categories.map(category => [category.name,rubles(category.amount)]))}
        <h3>Товары в выданных заявках — топ 20</h3>${table(['Товар','Количество','Выручка'],stats.products.map(product => [product.name,product.qty,rubles(product.amount)]))}
        <h3>Внесённые операции</h3>${table(['Дата','Тип','Категория','Сумма','Комментарий'],stats.entries.map(entry => [entry.date,entry.kind === 'income' ? 'Доход' : 'Расход',entry.category,rubles(entry.amount),entry.note]))}
        <div class="row">${stats.entries.map(entry => `<button type="button" class="secondary" data-remove-entry="${entry.id}">Удалить операцию № ${entry.id} · ${escape(entry.category)} · ${rubles(entry.amount)}</button>`).join('')}</div>`;
        for (const button of report.querySelectorAll('[data-remove-entry]')) button.addEventListener('click',async () => {
          if (!window.confirm(translate("Удалить эту операцию из финансового отчёта?"))) return;
          button.disabled = true;
          try {
            await api(storeApi('/ledger/remove'),{id:Number(button.dataset.removeEntry)});
            await loadReport();
          } catch (error) {
            notice.textContent = error.message;
            button.disabled = false;
          }
        });
      } catch (error) {
        if (current === reportRequest) report.textContent = 'Не удалось загрузить отчёт. '+error.message;
      }
    }
    handle(reportForm,loadReport);
    let entryKey = '', entrySignature = '';
    handle(ledgerForm,async data => {
      const entry = {kind:data.kind,date:data.date,category:data.category,note:data.note,amount:Math.round(Number(data.amount)*100)};
      const signature = JSON.stringify(entry);
      if (signature !== entrySignature) { entryKey = randomKey(); entrySignature = signature; }
      await api(storeApi('/ledger'),{...entry,key:entryKey});
      ledgerForm.reset();
      ledgerForm.elements.date.value = moscowDate(new Date());
      entrySignature = ''; entryKey = '';
      document.querySelector('#ledger-feedback').textContent = 'Операция добавлена. Если её дата вне выбранного периода, измените период отчёта.';
      await loadReport();
    });
    await loadReport();
  }
  const copyButton = document.querySelector('#copy-store-link');
  if (copyButton) copyButton.addEventListener('click',async () => {
    const feedback = document.querySelector('#copy-feedback');
    const url = new URL(DEMO_BASE+'#/shop/'+store.slug,location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      feedback.textContent = 'Ссылка скопирована.';
    } catch {
      feedback.replaceChildren();
      const label = document.createElement('label');
      label.textContent = 'Скопируйте ссылку вручную';
      const field = document.createElement('input');
      field.value = url;
      field.readOnly = true;
      label.append(field);
      feedback.append(label);
      field.focus();
      field.select();
    }
  });
  for (const form of document.querySelectorAll('.staff-access')) handle(form,async data => {
    await api(storeApi('/staff/update'),{email:form.dataset.email,enabled:data.enabled === 'on',canEditPrices:data.canEditPrices === 'on'});
    await manage();
    notice.textContent = 'Права сотрудника сохранены.';
  });
  if (activeSection === 'photos' && location.hash.startsWith('#photo-')) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }
  let orders = requests;
  let filter = 'new';
  let changingOrder = false;
  let refreshTask;
  const filters = {new:'Новые',accepted:'В сборке',ready:'К выдаче',archive:'Архив'};
  const matches = (order,value) => value === 'archive'
    ? ['completed','cancelled'].includes(order.status) : order.status === value;
  function drawOrders() {
    document.querySelector('#order-summary').innerHTML = [['Новые',orders.filter(order=>order.status==='new').length],['В сборке',orders.filter(order=>order.status==='accepted').length],['К выдаче',orders.filter(order=>order.status==='ready').length]].map(([label,count])=>`<div><strong>${count}</strong><span>${label}</span></div>`).join('');
    document.querySelector('#order-filters').innerHTML = Object.entries(filters).map(([value,label]) =>
      `<button type="button" class="secondary" data-filter="${value}" aria-pressed="${filter === value}">${label} · ${orders.filter(order => matches(order,value)).length}</button>`).join('');
    for (const button of document.querySelectorAll('[data-filter]')) button.addEventListener('click',() => {
      if (changingOrder) return;
      filter = button.dataset.filter;
      drawOrders();
    });
    document.querySelector('#requests').innerHTML = renderRequests(orders.filter(order => matches(order,filter)));
    bindOrders();
  }
  async function refresh() {
    if (changingOrder || refreshTask) return;
    const sync = document.querySelector('#order-sync');
    refreshTask = (async () => {
      try {
        const latest = (await api(storeApi(''))).requests;
        if (!changingOrder && JSON.stringify(latest) !== JSON.stringify(orders)) {
          const incoming=latest.filter(order=>order.status==='new'&&!orders.some(old=>old.id===order.id));
          if(incoming.length){notice.textContent='Новые заявки: '+incoming.map(o=>'№ '+o.id).join(', ');document.title='Новая заявка · TapStore';}
          orders = latest;
          drawOrders();
        }
        sync.textContent = 'Проверено в '+new Date().toLocaleTimeString(demoLocale)+'. Автообновление каждые 5 секунд.';
        sync.dataset.error = 'false';
      } catch (error) {
        sync.dataset.error = 'true';
        sync.textContent = 'Не удалось обновить заявки. Повторим автоматически. '+error.message;
      }
    })();
    try { await refreshTask; } finally { refreshTask = null; }
  }
  function bindOrders() {
    for (const form of document.querySelectorAll('[data-request]')) handle(form,async (data,button) => {
      if (changingOrder) return;
      changingOrder = true;
      try {
        await api(storeApi('/requests/'+form.dataset.request),{previous:form.dataset.status,status:button.value,note:data.note});
        if (refreshTask) await refreshTask;
        orders = (await api(storeApi(''))).requests;
        drawOrders();
      } finally { changingOrder = false; }
    });
  }
  if (activeSection === 'requests') {
    drawOrders();
    document.querySelector('#refresh').addEventListener('click',refresh);
    autoUpdate(refresh);
  }
  for (const form of document.querySelectorAll('[data-photo]')) handle(form,async (data,button) => {
    const removing = button?.value === 'remove';
    const image = removing ? null : await photoBase64(data.photo);
    await api(storeApi('/photos/'+form.dataset.photo),{image});
    await manage();
    notice.textContent = removing ? 'Фотография удалена.' : 'Фотография сохранена.';
  });
  const settings = document.querySelector('#settings');
  if (settings) handle(settings,async data => {
    await api(storeApi('/store'),{...data,published:data.published==='on',deliveryEnabled:data.deliveryEnabled==='on'});
    await manage();
    notice.textContent = 'Настройки сохранены.';
  });
  for (const form of document.querySelectorAll('.product-form')) handle(form,async (data,button) => {
    const id = form.dataset.id ? Number(form.dataset.id) : null;
    if (button?.value === 'remove') {
      if (!window.confirm(translate("Удалить товар из каталога и с витрины?"))) return;
      await api(storeApi('/products/remove'),{id});
      await manage();
      notice.textContent = 'Товар удалён.';
    } else {
      const image = data.photo?.size ? await photoBase64(data.photo) : undefined;
      const saved = await api(storeApi('/products'),{name:data.name,variants:data.variants,price:Number(data.price),discount:Number(data.discount),inStock:data.inStock==='on',active:data.active==='on',allowed:data.allowed==='on',id});
      const productId = id ?? saved.id;
      form.dataset.id = productId;
      if (image !== undefined || data.removePhoto === 'on') {
        try {
          await api(storeApi('/photos/'+productId),{image:image ?? null});
        } catch (error) {
          throw new Error('Товар сохранён. Фото не сохранено: '+error.message+' Повторите сохранение.');
        }
      }
      await manage();
      notice.textContent = id === null ? 'Товар добавлен.' : 'Товар сохранён.';
    }
  });
  const staff = document.querySelector('#staff');
  if (staff) handle(staff,async data => {
    await api(storeApi('/staff'),{...data,canEditPrices:data.canEditPrices === 'on'});
    await manage();
    notice.textContent = 'Учётная запись создана. Для входа выберите роль «Сотрудник».';
  });
}
const randomKey = () => Array.from(crypto.getRandomValues(new Uint8Array(24)),n => n.toString(16).padStart(2,'0')).join('');
function categoryOf(product) {
  if (/лимонад|напит|сок|вода|soda|juice/i.test(product.name)) return 'drinks';
  if (/бокал|стакан|аксессуар|glass/i.test(product.name)) return 'accessories';
  if (/сыр|орех|чипс|сухар|снек|закуск|nuts|cheese/i.test(product.name)) return 'snacks';
  return 'other';
}
function productIllustration(product) {
  const category = categoryOf(product);
  const nuts = /орех|nuts/i.test(product.name);
  const shapes = category === 'drinks' ? `<rect x="143" y="44" width="34" height="24" rx="5" fill="#174f42"/><path d="M143 68 L128 96 L125 215 Q125 234 144 234 H178 Q197 234 197 215 L194 96 L177 68Z" fill="#e6c45a" stroke="#ae913d" stroke-width="2"/><rect x="127" y="124" width="69" height="65" rx="3" fill="#fff9df"/><circle cx="162" cy="155" r="20" fill="#efce5c"/><path d="M150 155h24m-12-12v24" stroke="#fff9df" stroke-width="3"/><path d="M177 124q26-31 29-8q-12 16-29 8" fill="#448b58"/>` : category === 'accessories' ? `<path d="M115 62H200L188 156Q181 176 158 176Q134 176 127 156Z" fill="#ffffff88" stroke="#668d80" stroke-width="3"/><path d="M125 98h65l-8 52q-7 17-24 17q-18 0-24-17Z" fill="#ead59b"/><path d="M158 176v48m-32 8h64" stroke="#668d80" stroke-width="5" stroke-linecap="round"/>` : nuts ? `<ellipse cx="160" cy="166" rx="104" ry="65" fill="#c6d1b7"/><ellipse cx="160" cy="151" rx="104" ry="55" fill="#f8f3df"/>${Array.from({length:16},(_,i)=>{const x=93+(i%5)*30+(i%2)*7,y=120+Math.floor(i/5)*20;return `<ellipse cx="${x}" cy="${y}" rx="16" ry="10" transform="rotate(${i*37} ${x} ${y})" fill="${['#b48045','#d5ad70','#9b6936'][i%3]}" stroke="#fff4d5" stroke-width="1.5"/>`;}).join('')}` : `<ellipse cx="160" cy="194" rx="112" ry="39" fill="#d2d8c7"/><ellipse cx="160" cy="184" rx="111" ry="34" fill="#faf6e9"/>${[0,1,2,3,4].map(i=>`<rect x="${90+i*18}" y="${87+i*6}" width="26" height="110" rx="10" transform="rotate(28 ${103+i*18} ${142+i*6})" fill="${i%2?'#d8a64d':'#e4bc6c'}" stroke="#b88c42" stroke-width="2"/>`).join('')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="270" viewBox="0 0 320 270"><rect width="320" height="270" fill="${category==='drinks'?'#e8eedf':category==='accessories'?'#e4ebe6':'#f0ece0'}"/><circle cx="254" cy="42" r="110" fill="#ffffff35"/><ellipse cx="160" cy="239" rx="72" ry="9" fill="#1b3d2820"/>${shapes}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function renderCart() {
  const entries = catalog.filter(p => cart.has(p.id));
  document.querySelector('#cart-items').innerHTML = entries.map(p => `<label class="row line">${escape(p.name)}${selectedVariants.get(p.id)?' · '+escape(selectedVariants.get(p.id)):''} · ${money(p.price)}<input class="quantity" aria-label="Количество: ${escape(p.name)}" type="number" min="0" max="20" value="${cart.get(p.id)}" data-qty="${p.id}" required></label>`).join('') || '<p>Добавьте товары из каталога.</p>';
  const updateTotal = () => { document.querySelector('#total').textContent = money(entries.reduce((n,p) => n + p.price*(cart.get(p.id)||0),0)); };
  updateTotal();
  const count = [...cart.values()].reduce((sum,qty)=>sum+qty,0);
  const cartButton = document.querySelector('#mobile-cart');
  if (cartButton) { cartButton.hidden = !count; cartButton.innerHTML = `<span>Корзина · ${count}</span><strong>${money(entries.reduce((sum,p)=>sum+p.price*(cart.get(p.id)||0),0))}</strong>`; }
  for (const button of document.querySelectorAll('[data-add]')) { const quantity=cart.get(Number(button.dataset.add))||0; if (!button.disabled) button.textContent=quantity ? 'В корзине · '+quantity : 'Добавить'; }
  document.querySelector('#submit-request').disabled = !entries.length;
  for (const field of document.querySelectorAll('[data-qty]')) field.addEventListener('change',() => {
    if (!field.validity.valid) return;
    if (Number(field.value)) { cart.set(Number(field.dataset.qty),Number(field.value)); updateTotal(); }
    else { cart.delete(Number(field.dataset.qty)); renderCart(); }
  });
}
async function storefront(slug) {
  const endpoint = '/api/shops/'+slug;
  const {store,products} = await api(endpoint);
  catalog = products;
  let attempt = '';
  let signature = '';
  const categoryLabels = {all:'Все товары',snacks:'Закуски',drinks:'Напитки',accessories:'Аксессуары',other:'Другое'};
  page.innerHTML = `<section class="hero store-hero template-${store.template==='lavender'?'lavender':'sky'}"><div><span class="eyebrow">Витрина магазина / Самовывоз</span><h1>${escape(store.name)}</h1><p class="store-description">${escape(store.description || 'Выберите любимое. Заберите по пути.')}</p><div class="store-details"><p>${escape(store.address)}</p>${store.hours?'<p>Часы работы: '+escape(store.hours)+'</p>':''}${store.contact?'<p>Контакты: '+escape(store.contact)+'</p>':''}</div></div><div class="pickup-note"><strong>Закажите заранее</strong><p>Дождитесь статуса «Готова к выдаче» и приходите за заявкой.</p></div></section>
    <div class="store-layout"><section><div class="catalog-top"><h2>Каталог</h2><span class="muted" id="product-count">${products.length}</span></div><div class="catalog-tools"><label class="catalog-search"><input id="catalog-search" type="search" placeholder="Найти в магазине" aria-label="Поиск товаров"></label></div><div class="category-tabs" role="group" aria-label="Категории товаров">${Object.entries(categoryLabels).filter(([id])=>id==='all'||products.some(p=>categoryOf(p)===id)).map(([id,label])=>`<button type="button" data-category="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div><div class="grid product-grid">
    ${products.map(p => `<article class="panel product-card${p.in_stock?'':' is-unavailable'}" data-product="${p.id}">${p.discount ? `<span class="discount-badge">−${p.discount}%</span>` : ''}<img class="product-photo" src="${p.has_photo ? endpoint+'/photos/'+p.id : productIllustration(p)}" alt="${p.has_photo ? escape(p.name) : 'Иллюстрация категории товара'}" loading="lazy"><div class="product-info"><span class="product-category">${categoryLabels[categoryOf(p)]}</span><h3>${escape(p.name)}</h3><div class="row"><b class="product-price">${money(p.price)}</b>${p.discount ? `<del class="muted">${money(p.original_price)}</del>` : ''}</div>${p.variants?'<label class="variant-picker">Вариант<select data-variant="'+p.id+'">'+p.variants.split('|').filter(Boolean).map(v=>'<option>'+escape(v)+'</option>').join('')+'</select></label>':''}<button data-add="${p.id}" ${p.in_stock ? '' : 'disabled'}>${p.in_stock ? 'Добавить' : 'Нет в наличии'}</button></div></article>`).join('') || '<p>Ассортимент скоро появится.</p>'}</div><p id="catalog-empty" class="empty-state" hidden>Ничего не найдено. Попробуйте другой запрос.</p></section>
    <form class="panel cart-panel" id="checkout"><h2>Ваша корзина</h2><div id="cart-items"></div>
    <p class="row cart-total"><b>Итого</b><strong id="total"></strong></p><label>Имя для выдачи<input name="name" maxlength="60" autocomplete="given-name" placeholder="Как к вам обращаться?" required></label>
    <label>Способ получения<select name="fulfillment" id="fulfillment"><option value="pickup">Самовывоз</option>${store.delivery_enabled?'<option value="delivery">Запрос доставки</option>':''}</select></label><label>Телефон или контакт<input name="contact" maxlength="120" autocomplete="tel"></label><label id="delivery-field" hidden>Адрес доставки<input name="deliveryAddress" maxlength="240" autocomplete="street-address"></label><label>Комментарий<textarea name="comment" maxlength="500" rows="3" placeholder="Пожелания к заявке"></textarea></label><p id="delivery-caption" class="muted" hidden>Это запрос доставки. Магазин согласует стоимость и время отдельно. Итог ниже — только товары.</p><button id="submit-request">Отправить заявку</button><p class="cart-caption">Самовывоз после подтверждения готовности.</p></form></div><button type="button" class="mobile-cart" id="mobile-cart" hidden></button>`;
  let category = 'all';
  const search = document.querySelector('#catalog-search');
  function filterCatalog() {
    let visible=0;
    for (const card of document.querySelectorAll('[data-product]')) {
      const product=products.find(p=>p.id===Number(card.dataset.product));
      const matches=(category==='all'||categoryOf(product)===category)&&product.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase().trim());
      card.hidden=!matches; if(matches) visible++;
    }
    document.querySelector('#product-count').textContent=visible+' / '+products.length;
    document.querySelector('#catalog-empty').hidden=visible!==0;
  }
  search.addEventListener('input',filterCatalog);
  for (const button of document.querySelectorAll('[data-category]')) button.addEventListener('click',()=>{category=button.dataset.category;for(const item of document.querySelectorAll('[data-category]'))item.setAttribute('aria-pressed',String(item===button));filterCatalog();});
  document.querySelector('#mobile-cart').addEventListener('click',()=>document.querySelector('#checkout').scrollIntoView({behavior:'smooth',block:'start'}));
  const deliverySelect=document.querySelector('#fulfillment');
  deliverySelect.addEventListener('change',()=>{const delivery=deliverySelect.value==='delivery';document.querySelector('#delivery-field').hidden=!delivery;document.querySelector('#delivery-caption').hidden=!delivery;document.querySelector('[name=deliveryAddress]').required=delivery;document.querySelector('[name=contact]').required=delivery;});
  for(const select of document.querySelectorAll('[data-variant]')){selectedVariants.set(Number(select.dataset.variant),select.value);select.addEventListener('change',()=>{selectedVariants.set(Number(select.dataset.variant),select.value);renderCart();});}
  renderCart();
  for (const button of document.querySelectorAll('[data-add]')) button.addEventListener('click',() => {
    if (document.querySelector('#checkout').dataset.busy) return;
    const id = Number(button.dataset.add);
    if (!catalog.find(product => product.id === id)?.in_stock) return;
    cart.set(id,Math.min(20,(cart.get(id)||0)+1));
    renderCart();
    notice.textContent = 'Товар добавлен в корзину.';
  });
  handle(document.querySelector('#checkout'),async data => {
    const order = {name:data.name,fulfillment:data.fulfillment,contact:data.contact,deliveryAddress:data.deliveryAddress,comment:data.comment,items:[...cart].map(([id,qty]) => ({id,qty,variant:selectedVariants.get(id)||'',price:catalog.find(p=>p.id===id).price}))};
    const current = JSON.stringify(order);
    if (signature !== current) { signature = current; attempt = randomKey(); }
    const result = await api(endpoint+'/requests',{...order,key:attempt});
    demoNavigate('/track/'+result.key);
  });
}
async function track(key) {
  stopUpdates();
  const order = await api('/api/track/'+key);
  page.innerHTML = `<section class="hero"><p>${escape(order.store)}</p><h1>Заявка № ${order.id}</h1><p>${escape(order.address)}</p></section>
    <section class="panel"><div class="row"><h2>${order.fulfillment==='delivery'?'Запрос доставки':'Самовывоз'}</h2><span id="tracking-status" class="pill">${labels[order.status]}</span></div>
    <ul>${list(order.items)}</ul><p><b>${money(order.total)}</b></p>
    <p class="muted">Сохраните ссылку. Статус обновляется автоматически каждые 5 секунд.</p>
    ${order.delivery_address?'<p>Адрес доставки: '+escape(order.delivery_address)+'</p>':''}${order.comment?'<p>Ваш комментарий: '+escape(order.comment)+'</p>':''}<p id="store-response">${order.staff_note?'Ответ магазина: '+escape(order.staff_note):''}</p><button id="refresh" class="secondary" type="button">Обновить статус</button>
    <p id="tracking-feedback" class="muted" role="status" hidden></p></section>`;
  const button = document.querySelector('#refresh');
  const status = document.querySelector('#tracking-status');
  const feedback = document.querySelector('#tracking-feedback');
  let currentStatus = order.status;
  let checking = false;
  async function refreshStatus() {
    if (checking) return;
    checking = true;
    button.disabled = true;
    button.textContent = 'Проверяем…';
    feedback.hidden = false;
    feedback.textContent = 'Запрашиваем актуальный статус заявки…';
    try {
      const latest = await api('/api/track/'+key);
      const label = labels[latest.status];
      const checkedAt = new Date().toLocaleTimeString(demoLocale);
      feedback.textContent = latest.status === currentStatus
        ? `Статус не изменился. Проверено в ${checkedAt}.`
        : `Статус обновлён — «${label}». Проверено в ${checkedAt}.`;
      status.textContent = label;
      document.querySelector('#store-response').textContent=latest.staff_note?'Ответ магазина: '+latest.staff_note:'';
      currentStatus = latest.status;
    } catch (error) {
      feedback.textContent = `Не удалось обновить статус. ${error.message}`;
    } finally {
      button.disabled = false;
      button.textContent = 'Обновить статус';
      checking = false;
    }
  }
  button.addEventListener('click',refreshStatus);
  autoUpdate(refreshStatus);
}
try {
  const {account} = await api('/api/session');
  if (account) {
    const link = document.querySelector('#cabinet-link');
    link.href = cabinet(account.role);
    link.textContent = account.role === 'buyer' ? 'Мой кабинет' : 'Кабинет магазина';
  }
  if (path.startsWith('/shop/')) await storefront(path.split('/')[2]);
  else if (path.startsWith('/track/')) await track(path.split('/')[2]);
  else {
    if (!account || (path === '/' && new URLSearchParams((location.hash.includes('?') ? '?'+location.hash.split('?')[1] : '')).has('role'))) {
      welcome(path === '/buyer' ? 'buyer' : 'owner');
    } else if (path !== cabinet(account.role)) {
      demoNavigate(cabinet(account.role));
    } else if (account.role === 'buyer') {
      await buyer();
    } else {
      await manage();
    }
  }
} catch (error) {
  page.textContent = error.message || 'Не удалось загрузить страницу';
}
