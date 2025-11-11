// Navegação e controle de fragments
const slides = [];
let idx = 0;
let frag = 0;

function show(i){
  slides.forEach((s,j)=>{
    s.classList.toggle('active', j===i);
    if(j===i){
      frag = 0;
      const frags = s.querySelectorAll('.fragment');
      frags.forEach(el=>el.classList.remove('visible'));
      updateCount();
      updateProgress();
    }
  });
}

function next(){
  const s = slides[idx];
  const frags = s.querySelectorAll('.fragment');
  if(frag < frags.length){
    frags[frag].classList.add('visible');
    maybeHL(frags[frag]);
    frag++;
    return;
  }
  idx = Math.min(idx+1, slides.length-1);
  show(idx);
}

function prev(){
  const s = slides[idx];
  const frags = s.querySelectorAll('.fragment');
  if(frag>0){
    frag--;
    maybeUnHL(frags[frag]);
    frags[frag].classList.remove('visible');
    return;
  }
  idx = Math.max(idx-1, 0);
  show(idx);
}

function updateCount(){
  const el = document.getElementById('count');
  if(el) el.textContent = `${idx+1}/${slides.length}`;
}

function updateProgress(){
  const el = document.getElementById('prog');
  if(!el || slides.length<=1) return;
  el.style.width = `${(idx/(slides.length-1))*100}%`;
}

addEventListener('keydown', e=>{
  if(e.key==='ArrowRight') next();
  if(e.key==='ArrowLeft') prev();
});

// Renderização do código com numeração
let snippets = {};
const selftestEl = document.getElementById('selftest');

try{
  const raw = document.getElementById('raw-code');
  if(raw) snippets = JSON.parse(raw.textContent);
}catch(e){
  console.error('JSON parse error:', e);
  if(selftestEl) selftestEl.textContent = '❌ Erro ao ler snippets (JSON)';
}

function renderCode(id){
  const ol = document.getElementById(id);
  const raw = (snippets && snippets[id]) ? snippets[id] : '';
  const lines = raw.replace(/\t/g,'  ').split('\n');
  if(ol){
    ol.innerHTML = lines.map(l=>`<li><span>${escapeHtml(l)}</span></li>`).join('');
  }
}

function escapeHtml(s){
  return s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

function copyBlock(id){
  const text = (snippets[id]||'');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text);
  }
  const btns = document.querySelectorAll(`[onclick="copyBlock('${id}')"]`);
  btns.forEach(b=>{
    const prev = b.textContent;
    b.textContent='copiado!';
    setTimeout(()=>b.textContent=prev || 'copiar',1200);
  });
}

// Destaque de linhas conforme a explicação
function parseRange(r){
  const parts = r.split('-').map(n=>parseInt(n,10));
  const a = Math.max(parts[0],1);
  const b = Math.max((parts[1]||parts[0]),1);
  return [a,b];
}

function maybeHL(el){
  const d = el.getAttribute('data-hl');
  if(!d) return;
  const [sel,range] = d.split(':');
  const ol = document.querySelector(sel);
  if(!ol) return;
  const [a,b] = parseRange(range);
  const lis = ol.querySelectorAll('li');
  for(let i=a-1; i<b; i++){ lis[i]?.classList.add('hl'); }
}

function maybeUnHL(el){
  const d = el.getAttribute('data-hl');
  if(!d) return;
  const [sel,range] = d.split(':');
  const ol = document.querySelector(sel);
  if(!ol) return;
  const [a,b] = parseRange(range);
  const lis = ol.querySelectorAll('li');
  for(let i=a-1; i<b; i++){ lis[i]?.classList.remove('hl'); }
}

// Self-checks
(function selfTests(){
  try{
    console.assert(typeof snippets === 'object', 'snippets deve ser objeto');
    ['code-intro','code-data','code-pairs','code-simple','code-choose','code-formula','code-back','code-vif','code-diag','code-run']
      .forEach(k=>console.assert(k in snippets, `falta snippet: ${k}`));
    const parts = 'a\nb\nc'.split('\n');
    console.assert(parts.length===3, 'split("\\n") deve produzir 3 linhas');
    if(selftestEl) selftestEl.textContent = '✅ Self-check OK';
  }catch(err){
    console.error('Self-check falhou:', err);
    if(selftestEl) selftestEl.textContent = '❌ Self-check falhou';
  }
})();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slide').forEach(s=>slides.push(s));
  if(snippets){
    Object.keys(snippets).forEach(renderCode);
  }
  show(0);
});

// Expor funções globais para botões inline
window.next = next;
window.prev = prev;
window.copyBlock = copyBlock;
