const preferences = new URLSearchParams(location.search);
export const language = ['ru','en'].includes(preferences.get('lang')) ? preferences.get('lang') : localStorage.getItem('tapstore-language') || 'ru';
export const demoLocale = language === 'en' ? 'en-US' : 'ru-RU';
export const currency = ['RUB','USD','EUR'].includes(preferences.get('currency')) ? preferences.get('currency') : localStorage.getItem('tapstore-currency') || (language === 'en' ? 'USD' : 'RUB');
const rates = {RUB:1,USD:100,EUR:110};
export function displayMoney(rubles) {
  return new Intl.NumberFormat(demoLocale,{style:'currency',currency,minimumFractionDigits:currency === 'RUB' ? 0 : 2,maximumFractionDigits:2}).format(rubles/rates[currency]);
}
const dictionary = Object.fromEntries(`
TAPSTORE ДЛЯ НЕБОЛЬШОГО БИЗНЕСА|TAPSTORE FOR SMALL BUSINESS
Ваш бизнес онлайн.|Your business online.
Всё под рукой.|Everything in one place.
Витрина, товары и заявки в одном понятном кабинете. Больше внимания покупателям, меньше повседневной рутины.|Your storefront, products and requests in one simple workspace. More time for customers, less routine work.
Войти в кабинет|Sign in
Посмотреть витрину|View storefront
Обзор магазина|Store overview
Пример интерфейса|Interface preview
Заявки за неделю|Requests this week
Выдано заказов|Collected orders
Иллюстративные данные, не показатели реального бизнеса|Illustrative data, not actual business results
Иллюстрация графика заявок|Illustrative request chart
К выдаче|Ready for pickup
Все товары|All products
Закуски|Snacks
Напитки|Drinks
Аксессуары|Accessories
Другое|Other
Витрина магазина / Самовывоз|Storefront / Pickup
Выберите любимое. Заберите по пути.|Pick your favorites. Collect on your way.
Закажите заранее|Order ahead
Дождитесь статуса «Готова к выдаче» и приходите за заявкой.|Wait until your request is ready for pickup before visiting.
Найти в магазине|Search this store
Поиск товаров|Search products
Категории товаров|Product categories
Ваша корзина|Your cart
Как к вам обращаться?|Your first name
Самовывоз после подтверждения готовности.|Collect after your request is marked ready.
Иллюстрация категории товара|Product category illustration
Ничего не найдено. Попробуйте другой запрос.|No products found. Try another search.
Здесь пока спокойно|All caught up
В этом статусе нет заявок. Новые появятся автоматически.|No requests in this status. New requests appear automatically.
Нет соединения. Показаны последние загруженные данные. Изменения не отправлены: подключитесь и повторите действие.|You are offline. Showing previously loaded data. Changes have not been sent: reconnect and try again.
Нет соединения. Подключитесь к интернету и повторите действие.|You are offline. Reconnect and try again.
Сервер не ответил. Проверьте соединение и повторите действие.|The server did not respond. Check your connection and try again.
В корзине|In cart
Рабочее демо TapStore|TapStore live demo
TapStore — рабочее демо|TapStore — live demo
Тестовые данные сохраняются в этом браузере. Выберите роль и пройдите путь от заявки до выдачи.|Test data stays in this browser. Choose a role and follow an order from checkout to pickup.
Подтвердить сброс демо|Confirm demo reset
Сбросить демо|Reset demo
Хмельная лавка · демо|Tap Corner · demo
Самара, ул. Демонстрационная, 12|12 Demo Street, Samara
Сырные палочки|Cheese sticks
Лимонад «Лимон и мята»|Lemon & mint soda
Ореховый микс|Mixed nuts
Подарочный бокал|Gift glass
Демонстрационная закупка|Demo stock purchase
Анна|Anna
Михаил|Michael
Кабинет владельца|Owner dashboard
Кабинет продавца|Staff dashboard
Кабинет покупателя|Customer account
Владелец|Owner
Сотрудник|Staff
Покупатель|Customer
Самовывоз|Pickup
Каталог|Catalog
Корзина|Cart
Добавить товары|Add products
Добавить товар|Add product
Добавить первый товар|Add your first product
Добавить|Add
Нет в наличии|Out of stock
В наличии|In stock
Имя для выдачи|Pickup name
Отправить заявку|Place demo order
Итого|Total
Добавьте товары из каталога.|Add items from the catalog.
Товар добавлен в корзину.|Added to cart.
Ассортимент скоро появится.|Products will be available soon.
Мой кабинет|My account
Кабинет магазина|Store dashboard
Вход по ролям|Choose a role
Заявка №|Order #
Заявки|Orders
Мои заявки|My orders
Витрины магазинов|Stores
У вас пока нет заявок.|You have no orders yet.
Пока нет опубликованных витрин.|No stores have been published yet.
Заявок пока нет.|No orders in this view.
Готова к выдаче|Ready for pickup
К выдаче|Ready for pickup
Готово к выдаче|Mark ready
Подтвердить выдачу|Complete pickup
В сборке|Preparing
Принять|Accept
Отменить|Cancel
Новые|New
Новая|New
Выдана|Collected
Отменена|Cancelled
Архив|Archive
Обновить статус|Refresh status
Обновить|Refresh
Проверяем…|Checking…
Запрашиваем актуальный статус заявки…|Checking the current order status…
Сохраните ссылку. Статус обновляется автоматически каждые 5 секунд.|Save this link. Order status refreshes automatically every 5 seconds.
Статус не изменился. Проверено в|Status unchanged. Checked at
Статус обновлён —|Status updated —
Проверено в|Checked at
Не удалось обновить статус.|Could not refresh the status.
Автообновление каждые 5 секунд.|Refreshes automatically every 5 seconds.
Не удалось обновить заявки. Повторим автоматически.|Could not refresh orders. Retrying automatically.
Фото товаров|Product photos
Фото карточки|Product photo
Фото сохранится вместе с товаром.|The photo will be saved with the product.
JPG, PNG или WebP, до 2 МБ на товар.|JPG, PNG or WebP, up to 2 MB per product.
JPG, PNG или WebP, до 2 МБ.|JPG, PNG or WebP, up to 2 MB.
Удалить текущее фото|Remove current photo
Выбрать фото|Choose photo
Заменить фото|Replace photo
Загрузить фото|Upload photo
Удалить фото|Remove photo
Фотография удалена.|Photo removed.
Фотография сохранена.|Photo saved.
Товар скрыт с витрины.|This product is hidden from the storefront.
В каталоге пока нет товаров.|No products in the catalog yet.
Выберите фотографию|Choose a photo
Фотография должна быть не больше 2 МБ|The photo must be 2 MB or smaller
Фото должно быть не больше 2 МБ|The photo must be 2 MB or smaller
Не удалось прочитать фотографию|Could not read the photo
Цена, ₽|Base price, RUB
Скидка, %|Discount, %
Сумма, ₽|Base amount, RUB
Для изменения цены и скидки владелец должен включить вам разрешение во вкладке «Сотрудники».|The owner must enable price editing for you in the Staff section to change prices and discounts.
0 — без скидки. Цена со скидкой округляется до целого рубля, минимум 1 ₽.|0 means no discount. Discounted base prices are rounded to whole RUB, with a minimum of 1 RUB.
Показывать на витрине|Show in storefront
Товар из ассортимента пилота: закуски, безалкогольные напитки или аксессуары|Demo product category: snacks, soft drinks or accessories
Сохранить товар|Save product
Удалить товар из каталога и с витрины?|Remove this product from the catalog and storefront?
Удалить товар|Remove product
Товар удалён.|Product removed.
Товар добавлен.|Product added.
Товар сохранён.|Product saved.
Фото не сохранено:|Photo was not saved:
Повторите сохранение.|Please save again.
нет в наличии|out of stock
скидка|discount
скрыт|hidden
Название магазина|Store name
Название|Name
Создать магазин|Create store
Адрес витрины|Store URL slug
Адрес самовывоза|Pickup address
Указать адрес самовывоза|Set a pickup address
От 3 до 40 символов: строчные латинские буквы, цифры и дефис. Например, my-shop.|3–40 characters: lowercase Latin letters, numbers and hyphens. For example, my-shop.
Вернуться в кабинет|Back to dashboard
Разделы кабинета|Dashboard sections
Запуск магазина|Launch your store
Добавьте хотя бы один товар, видимый на витрине.|Add at least one visible product to your storefront.
Опубликовать витрину|Publish storefront
Открыть витрину ↗|Open storefront
Скопировать ссылку|Copy link
Ссылка скопирована.|Link copied.
Скопируйте ссылку вручную|Copy this link manually
Настройки сохранены.|Settings saved.
Витрина|Storefront
Магазин|Store
Открыть|Open
Сохранить доступ|Save access
Сохранить|Save
Сотрудники|Staff
Доступ открыт|Access enabled
Доступ отключён|Access disabled
Разрешить вход и работу в магазине|Allow sign-in and store access
Разрешить менять цены товаров|Allow price and discount editing
Сотрудники пока не добавлены.|No staff accounts yet.
Добавить сотрудника|Add staff member
Создать учётную запись|Create account
Права сотрудника сохранены.|Staff permissions saved.
Учётная запись создана. Для входа выберите роль «Сотрудник».|Account created. Choose Staff to sign in.
Выйти|Sign out
Ваша витрина в интернете|Your store, online
Добавьте товары, поделитесь ссылкой с покупателями и принимайте заявки на самовывоз.|Add products, share your storefront and accept pickup orders.
Войти как владелец|Sign in as owner
Войти как сотрудник|Sign in as staff
Войти как покупатель|Sign in as customer
Регистрация владельца|Owner registration
Регистрация покупателя|Customer registration
Создать магазин можно в кабинете после регистрации.|Create your store in the dashboard after registration.
Заявки, оформленные после входа, появятся в вашем кабинете.|Orders placed after sign-in appear in your account.
Почту и пароль для входа выдаёт владелец магазина.|Your store owner provides your sign-in details.
Электронная почта|Email
Пароль|Password
Зарегистрироваться|Register
Регистрация|Register
Вход или регистрация|Sign in or register
Роль при входе и регистрации|Choose an account role
Войти|Sign in
Вход|Sign in
Демо — любой пароль от 12 символов|Demo — any password of 12+ characters
Аналитика|Analytics
Последние 24 часа|Last 24 hours
Последние 7 дней|Last 7 days
Последние 30 дней|Last 30 days
Период|Period
Заявки, созданные за выбранный период, по их текущему статусу. Сумма и средний чек рассчитаны по выданным заявкам.|Orders created in the selected period, grouped by current status. Revenue and average order value include collected orders.
Поступило заявок|Orders received
Сумма выданных заявок|Collected order revenue
Средний чек выданных заявок|Average collected order value
Средний чек|Average order value
Выдано за период|Collected in period
Выдано|Collected
Отменено из поступивших|Received orders cancelled
Отменено|Cancelled
Финансовый отчёт —|Financial report —
С даты|From
По дату|To
Показать отчёт|Show report
Даты по Москве. Выручка учитывается при выдаче заявки. Внесите закупки, аренду, зарплаты, налоги и другие расходы вручную. Итог показывает разницу учтённых доходов и расходов.|Dates use Moscow time. Revenue is recorded at pickup. Enter purchases, rent, wages, taxes and other expenses manually. The balance is recorded income minus recorded expenses.
Добавить доход или расход|Add income or expense
Выданные заявки TapStore уже включены в доход. Здесь добавляйте только другие доходы и расходы.|Collected TapStore orders are already included in income. Add only other income and expenses here.
Другой доход|Other income
Другие доходы|Other income
Всего доходов|Total income
Расходы по категориям|Expenses by category
Доходы и расходы по дням|Daily income and expenses
Итог за период|Period balance
Выручка TapStore|TapStore revenue
Товары в выданных заявках — топ 20|Top 20 products in collected orders
Внесённые операции|Manual entries
Удалить операцию №|Remove entry #
Удалить эту операцию из финансового отчёта?|Remove this entry from the financial report?
Операция добавлена. Если её дата вне выбранного периода, измените период отчёта.|Entry added. If its date falls outside this report, change the date range to see it.
Добавить операцию|Add entry
За этот период данных нет.|No data for this period.
Загружаем отчёт…|Loading report…
Загружаем…|Loading…
Загрузка…|Loading…
Не удалось загрузить аналитику.|Could not load analytics.
Не удалось загрузить отчёт.|Could not load the report.
Не удалось загрузить страницу|Could not load this page
Ошибка соединения|Connection error
Статусы заявок|Order statuses
Закупки|Purchases
Аренда|Rent
Зарплаты|Wages
Налоги|Taxes
Реклама|Advertising
Прочее|Other
Расходы|Expenses
Расход|Expense
Доходы|Income
Доход|Income
Выручка|Revenue
Итог|Balance
Товар|Product
Количество|Quantity
Категория|Category
Сумма|Amount
Комментарий|Comment
Дата|Date
Тип|Type
В браузере недостаточно места. Уменьшите фотографии или сбросьте демо.|Browser storage is full. Use smaller photos or reset the demo.
Витрина не опубликована|The storefront is not published
Цена или наличие изменились. Обновите витрину.|Price or availability changed. Refresh the storefront.
Заявка не найдена|Order not found
Выберите роль в панели демо|Choose a role in the demo panel
Войдите как владелец или сотрудник|Sign in as owner or staff
Нет доступа к магазину|You do not have access to this store
Доступно владельцу|Available to the owner
Этот адрес занят|This URL slug is already in use
Магазин не найден|Store not found
Обновите список заявок|Refresh the order list
Товар не найден|Product not found
Заполните название и подтвердите категорию|Enter a name and confirm the product category
Проверьте цену и скидку|Check the price and discount
Укажите адрес самовывоза|Enter a pickup address
Эта почта уже используется|This email is already in use
Сотрудник не найден|Staff member not found
Выберите период|Choose a date range
Действие не найдено|Action not found
`.trim().split('\n').map(row => row.split('|')));
const phrases = Object.keys(dictionary).sort((a,b) => b.length-a.length);
export function translate(value) {
  if(language !== 'en') return value;
  let text = String(value).replace(/Готово (\d+) из 3 шагов\./g,'$1 of 3 steps complete.');
  for(const phrase of phrases) text = text.replaceAll(phrase,dictionary[phrase]);
  return text.replace(' — готово',' — complete');
}
function translatePage() {
  if(language !== 'en') return;
  const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes = [];
  while(walker.nextNode()) {
    const node=walker.currentNode;
    if(!['SCRIPT','STYLE','TEXTAREA'].includes(node.parentElement?.tagName) && /[А-Яа-яЁё]/.test(node.data)) nodes.push(node);
  }
  for(const node of nodes) {const value=translate(node.data);if(value !== node.data) node.data=value;}
  for(const element of document.querySelectorAll('[placeholder],[aria-label],[title],[alt]')) {
    for(const attribute of ['placeholder','aria-label','title','alt']) {
      const value=element.getAttribute(attribute);
      if(value && /[А-Яа-яЁё]/.test(value)) element.setAttribute(attribute,translate(value));
    }
  }
  document.title=translate(document.title);
}
export function setupI18n() {
  localStorage.setItem('tapstore-language',language);
  localStorage.setItem('tapstore-currency',currency);
  document.documentElement.lang=language;
  const controls=document.createElement('section');controls.className='panel locale-controls';
  controls.innerHTML=`<div class="row"><label>${language === 'en' ? 'Language' : 'Язык'}<select id="demo-language"><option value="ru">Русский</option><option value="en">English</option></select></label><label>${language === 'en' ? 'Display currency' : 'Валюта отображения'}<select id="demo-currency"><option value="RUB">RUB ₽</option><option value="USD">USD $</option><option value="EUR">EUR €</option></select></label></div><p class="muted">${language === 'en' ? 'Illustrative demo rates: 1 USD = 100 RUB, 1 EUR = 110 RUB. Product prices and manual entries are entered in base RUB.' : 'Примерные курсы для демо: 1 USD = 100 RUB, 1 EUR = 110 RUB. Цены товаров и ручные операции вводятся в базовых рублях.'}</p>`;
  document.querySelector('main').prepend(controls);
  const localeSelect=controls.querySelector('#demo-language'),currencySelect=controls.querySelector('#demo-currency');
  localeSelect.setAttribute('aria-label',language === 'en' ? 'Language' : 'Язык');
  currencySelect.setAttribute('aria-label',language === 'en' ? 'Display currency' : 'Валюта отображения');
  localeSelect.value=language;currencySelect.value=currency;
  function change(languageChanged) {
    const url=new URL(location.href);
    url.searchParams.set('lang',localeSelect.value);
    url.searchParams.set('currency',languageChanged ? (localeSelect.value === 'en' ? 'USD' : 'RUB') : currencySelect.value);
    location.href=url.href;
  }
  localeSelect.addEventListener('change',() => change(true));
  currencySelect.addEventListener('change',() => change(false));
  new MutationObserver(translatePage).observe(document.body,{childList:true,subtree:true,characterData:true});
  translatePage();
}
