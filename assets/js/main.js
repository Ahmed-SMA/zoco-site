// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const delay = e.target.dataset.delay || 0;
      setTimeout(()=> e.target.classList.add('is-visible'), delay);
      io.unobserve(e.target);
    }
  })
},{threshold:0.18});
revealEls.forEach(el=>io.observe(el));

// 3D Coverflow (square)
class Coverflow{
  constructor(root){
    this.root = root;
    this.stage = root.querySelector('.coverflow__stage');
    this.items = Array.from(root.querySelectorAll('.coverflow__item'));
    this.prevBtn = root.querySelector('.coverflow__btn.prev');
    this.nextBtn = root.querySelector('.coverflow__btn.next');
    this.dots = root.querySelector('.coverflow__dots');
    this.index = 0;
    this.autoplay = root.dataset.autoplay === 'true';
    this.interval = parseInt(root.dataset.interval || '3000',10);
    this.timer = null;
    this.setupDots();
    this.update();
    this.prevBtn.addEventListener('click', ()=>this.go(-1));
    this.nextBtn.addEventListener('click', ()=>this.go(1));
    this.root.addEventListener('mouseenter', ()=>this.pause());
    this.root.addEventListener('mouseleave', ()=>this.play());
    let startX = 0, dx = 0;
    this.stage.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; this.pause(); }, {passive:true});
    this.stage.addEventListener('touchmove', (e)=>{ dx = e.touches[0].clientX - startX; }, {passive:true});
    this.stage.addEventListener('touchend', ()=>{ if(Math.abs(dx) > 40) this.go(dx>0? -1: 1); this.play(); dx=0; });
    if(this.autoplay) this.play();
  }
  setupDots(){
    this.dots.innerHTML = '';
    this.items.forEach((_,i)=>{
      const b = document.createElement('button');
      b.addEventListener('click',()=>{ this.index = i; this.update(true); });
      this.dots.appendChild(b);
    });
  }
  go(dir){
    this.index = (this.index + dir + this.items.length) % this.items.length;
    this.update(true);
  }
  update(){
    const mid = this.index;
    this.items.forEach((item,i)=>{
      const offset = i - mid;
      const abs = Math.abs(offset);
      const z = -Math.min(abs*140, 520);
      const rot = offset * -24;
      const x = offset * 240;
      const s = abs === 0 ? 1 : 0.84 - abs*0.04;
      item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg) scale(${s})`;
      item.style.opacity = abs > 3 ? 0 : 0.92 - abs*0.14;
      item.style.filter = abs === 0 ? 'brightness(1) saturate(1.04)' : 'brightness(.86) saturate(.96)';
    });
    Array.from(this.dots.children).forEach((d,i)=>d.classList.toggle('active', i===this.index));
  }
  play(){ if(this.autoplay){ this.timer = setInterval(()=>this.go(1), this.interval); } }
  pause(){ if(this.timer){ clearInterval(this.timer); this.timer=null; } }
}
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.coverflow').forEach(c=> new Coverflow(c));
  const y = document.getElementById('year'); if(y){ y.textContent = new Date().getFullYear(); }
});

// Location popup with province->city cascade (Pakistan sample)
const provinces = {
  'Punjab': ['Lahore','Rawalpindi','Faisalabad','Gujranwala','Multan','Sialkot','Bahawalpur','Sargodha'],
  'Sindh': ['Karachi','Hyderabad','Sukkur','Larkana','Nawabshah','Mirpur Khas'],
  'Khyber Pakhtunkhwa': ['Peshawar','Abbottabad','Mardan','Swat','Kohat','Dera Ismail Khan'],
  'Balochistan': ['Quetta','Gwadar','Khuzdar','Turbat'],
  'Islamabad Capital Territory': ['Islamabad'],
  'AJK': ['Muzaffarabad','Mirpur','Bhimber'],
  'Gilgit-Baltistan': ['Gilgit','Skardu','Hunza']
};

function openLocationDialog(){
  const dlg = document.getElementById('locationDialog');
  const provSel = document.getElementById('provinceSelect');
  const citySel = document.getElementById('citySelect');
  provSel.innerHTML = '<option value="">Select province…</option>';
  Object.keys(provinces).forEach(p=>{
    const opt = document.createElement('option'); opt.value = p; opt.textContent = p; provSel.appendChild(opt);
  });
  citySel.innerHTML = '<option value="">Select city…</option>';
  provSel.onchange = ()=>{
    citySel.innerHTML = '<option value="">Select city…</option>';
    (provinces[provSel.value]||[]).forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; citySel.appendChild(o); });
  };
  dlg.showModal();
}
function saveLocation(){
  const provSel = document.getElementById('provinceSelect');
  const citySel = document.getElementById('citySelect');
  if(!provSel.value || !citySel.value) return;
  const loc = {province: provSel.value, city: citySel.value};
  localStorage.setItem('zoco_location', JSON.stringify(loc));
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btn1 = document.getElementById('openLocation');
  const btn2 = document.getElementById('openLocationQuote');
  const dlg = document.getElementById('locationDialog');
  const saveBtn = document.getElementById('saveLocation');
  if(btn1) btn1.addEventListener('click', openLocationDialog);
  if(btn2) btn2.addEventListener('click', openLocationDialog);
  if(saveBtn) saveBtn.addEventListener('click', saveLocation);
});

// Lead capture -> localStorage + CSV export
function addLead(e){
  e.preventDefault();
  const f = e.target;
  const lead = {
    name: f.name.value.trim(),
    email: f.email.value.trim(),
    phone: f.phone.value.trim(),
    address: f.address.value.trim(),
    ts: new Date().toISOString()
  };
  const key = 'zoco_leads';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.push(lead);
  localStorage.setItem(key, JSON.stringify(arr));
  alert('Thanks! We\'ll be in touch.');
  f.reset();
  return false;
}

function exportLeads(){
  const arr = JSON.parse(localStorage.getItem('zoco_leads') || '[]');
  if(arr.length === 0){ alert('No contacts yet.'); return; }
  const header = ['name','email','phone','address','ts'];
  const rows = [header.join(',')].concat(arr.map(o => header.map(h => ('"'+String(o[h]||'').replace(/"/g,'""')+'"')).join(',')));
  const csv = rows.join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'zoco_contacts.csv'; a.click();
  URL.revokeObjectURL(url);
}

// subtle parallax for hero shapes
(function(){
  const root = document.querySelector('.hero__bg');
  if(!root) return;
  const orbA = root.querySelector('.orb-a');
  const orbB = root.querySelector('.orb-b');
  const ring = root.querySelector('.hero-ring');
  const tile = root.querySelector('.hero-tile3d');
  const damp = (v, d=24) => v / d;

  root.addEventListener('mousemove', (e)=>{
    const r = root.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);

    if(orbA) orbA.style.transform = `translate(${damp(-x)}px, ${damp(-y)}px)`;
    if(orbB) orbB.style.transform = `translate(${damp(x)}px, ${damp(y)}px)`;
    if(ring) ring.style.transform  = `rotateX(58deg) rotateZ(${10 + damp(x,60)}deg) translateZ(40px)`;
    if(tile) tile.style.transform  = `rotateY(${-14 + damp(x,40)}deg) rotateX(${8 + damp(-y,40)}deg) translateZ(60px)`;
  });
})();
