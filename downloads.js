'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();
const lista = document.querySelector('#tools');
async function carregar() {
  try {
    const response = await fetch('/scripts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Catálogo indisponível');
    const scripts = await response.json();
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
    if (!scripts.length) lista.textContent = 'Nenhum arquivo disponível no momento.';
  } catch (error) {
    lista.textContent = 'Não foi possível carregar os downloads. Atualize a página para tentar novamente.';
    console.error('Falha ao carregar catálogo:', error);
  }
}
// A origem e o renderizador do catálogo permanecem os mesmos.
function navegar(focus = false) {
  const requested = location.hash.slice(1);
  const section = ['downloads', 'scripts', 'openspeedtest'].includes(requested) ? requested : 'home';
  for (const id of ['home', 'downloads', 'scripts', 'openspeedtest']) {
    document.getElementById(id).hidden = id !== section;
  }
  const names = { home: 'Central de Suporte', downloads: 'Downloads', scripts: 'Scripts', openspeedtest: 'OpenSpeedTest' };
  document.title = `${names[section]} | Lackman Informática`;
  if (section === 'scripts') carregar();
  if (section === 'openspeedtest' && !document.querySelector('#speedtest-frame').hasAttribute('src')) {
    const url = new URL('/openspeedtest/', location.origin);
    document.querySelector('#speedtest-frame').src = url.href;
    document.querySelector('#speedtest-link').href = url.href;
  }
  if (focus) {
    const target = section === 'home' ? document.querySelector('.navigation-card') : document.getElementById(`${section}-title`);
    target.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', () => navegar(true));
navegar();
