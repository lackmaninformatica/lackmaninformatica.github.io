'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();
const lista = document.querySelector('#tools');
let catalogRequest = 0;
async function carregar(platform) {
  const request = ++catalogRequest;
  lista.textContent = 'Carregando scripts…';
  try {
    const response = await fetch('/scripts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Catálogo indisponível');
    const catalog = await response.json();
    if (request !== catalogRequest) return;
    const scripts = catalog.filter(script => script.platform === platform);
    const groups = new Map();
    for (const script of scripts) {
      const parts = script.path.split('/');
      if (parts.some(p => !p || p === '.' || p === '..' || p.includes('\\'))) throw new Error('Caminho inválido');
      const category = script.category || '';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(script);
    }
    const fragment = document.createDocumentFragment();
    for (const [category, scripts] of groups) {
      if (category) {
        const heading = document.createElement('li');
        heading.className = 'category-heading';
        const title = document.createElement('h3');
        title.textContent = category;
        heading.append(title);
        fragment.append(heading);
      }
      for (const script of scripts) {
        const card = document.createElement('li');
        card.className = 'tool';
        const icon = document.createElement('span');
        icon.className = 'file-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '>_';
        const title = document.createElement('h3');
        title.textContent = script.name;
        const description = document.createElement('p');
        description.textContent = `${script.type} • ${script.extension}`;
        const button = document.createElement('a');
        button.className = 'download';
        button.textContent = '↓ Baixar';
        button.setAttribute('aria-label', `Baixar ${script.name}`);
        button.href = '/downloads/' + script.path.split('/').map(encodeURIComponent).join('/');
        button.download = script.filename;
        card.append(icon, title, description, button);
        fragment.append(card);
      }
    }
    lista.replaceChildren(fragment);
    if (!scripts.length) {
      const empty = document.createElement('li');
      empty.className = 'script-empty';
      empty.textContent = `Nenhum script para ${platform === 'linux' ? 'Linux' : 'Windows'} disponível no momento.`;
      lista.append(empty);
    }
  } catch (error) {
    if (request !== catalogRequest) return;
    lista.textContent = 'Não foi possível carregar os downloads. Atualize a página para tentar novamente.';
    console.error('Falha ao carregar catálogo:', error);
  }
}
function navegar(focus = false) {
  const requested = location.hash.slice(1);
  const route = /^(downloads|scripts)\/(windows|linux)$/.exec(requested);
  const section = route ? route[1] : ['downloads', 'scripts', 'openspeedtest'].includes(requested) ? requested : 'home';
  const platform = route ? route[2] : null;
  const downloadPlatform = section === 'downloads' ? platform : null;
  const scriptPlatform = section === 'scripts' ? platform : null;
  for (const id of ['home', 'downloads', 'scripts', 'openspeedtest']) {
    document.getElementById(id).hidden = id !== section;
  }
  document.getElementById('download-systems').hidden = downloadPlatform !== null;
  document.getElementById('download-content').hidden = downloadPlatform === null;
  for (const name of ['windows', 'linux']) {
    document.getElementById(`download-${name}`).hidden = name !== downloadPlatform;
  }
  document.getElementById('script-systems').hidden = scriptPlatform !== null;
  document.getElementById('script-content').hidden = scriptPlatform === null;
  document.querySelectorAll('[data-platform]').forEach(link => {
    if (link.dataset.platform === downloadPlatform) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-script-platform]').forEach(link => {
    if (link.dataset.scriptPlatform === scriptPlatform) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const names = { home: 'Central de Suporte', downloads: 'Downloads', scripts: 'Scripts', openspeedtest: 'OpenSpeedTest' };
  const platformName = platform === 'windows' ? 'Windows' : 'Linux';
  document.title = `${platform ? `${names[section]} para ${platformName}` : names[section]} | Lackman Informática`;
  document.getElementById('downloads-description').textContent = downloadPlatform
    ? `Programas e materiais para ${platformName}, com links para as fontes oficiais.`
    : 'Escolha o sistema operacional para encontrar os programas e materiais adequados.';
  document.getElementById('scripts-description').textContent = scriptPlatform
    ? `Scripts de suporte técnico para ${platformName}.`
    : 'Escolha o sistema operacional para encontrar os scripts adequados.';
  document.getElementById('scripts-platform-title').textContent = scriptPlatform ? `Scripts para ${platformName}` : '';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  catalogRequest++;
  if (scriptPlatform) carregar(scriptPlatform);
  if (focus) {
    const target = scriptPlatform ? document.getElementById('scripts-platform-title')
      : downloadPlatform ? document.getElementById(`${downloadPlatform}-downloads-title`)
      : section === 'home' ? document.querySelector('.navigation-card')
      : document.getElementById(`${section}-title`);
    target.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', () => navegar(true));
navegar();
