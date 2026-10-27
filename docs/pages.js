// GitHub Pages serves the demo; real partner requests stay on the protected server.
loadProjectSession = async function(){isProjectOwner=false;};
openPartnerForm = function(){
  document.querySelector('#modal').innerHTML=`<div class="row"><span class="eyebrow">ПИЛОТ TAPSTORE</span><button class="secondary" aria-label="Закрыть форму" onclick="closeModal()">✕</button></div><h2>Стать первым партнёром</h2><p>Демонстрация работает на GitHub Pages. Для сохранения контактов откройте защищённую форму проекта на отдельном сайте.</p><p class="note">На странице формы потребуется вход через ChatGPT. Выберите «Стать первым партнёром» и заполните заявку. Данные сохранятся на сервере и будут доступны владельцу TapStore.</p><a class="primary full" style="display:block;text-align:center;text-decoration:none" href="https://tapstore-demo-ruslan.violetleaf7.chatgpt.site/" target="_blank" rel="noopener noreferrer">Открыть защищённую форму ↗</a><p class="note">Условия пилота согласовываются отдельно. Оплата не требуется.</p>`;
  document.querySelector('#modal').showModal();
};
