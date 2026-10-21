const opening = document.getElementById('opening');
const openButton = document.getElementById('open');
const journey = document.getElementById('journey');
const skipButton = document.getElementById('skip-entrance');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const content = [...document.querySelectorAll('header, main, footer, .chapter-nav')];
const films = [...document.querySelectorAll('video.scene-media, video.hero-film')];
const openingFilm = document.getElementById('opening-film');
const courtyardFilm = document.getElementById('courtyard-film');
const hallFilm = document.getElementById('journey-hall-film');
const heroFilm = document.getElementById('hero-film');
const motionButtons = [document.getElementById('motion'), document.getElementById('intro-motion')];
let userMotionPaused = false;
let manualMotion = false;
const enterStill = document.getElementById('enter-still');
function prefersStill() { return reduceMotion.matches && !manualMotion; }
let heroVisible = true;
let heroSynced = false;
let hasOpened = false;
let entranceRun = 0;
let entranceAnimations = [];
let entranceTimers = [];
function motionAllowed() { return !userMotionPaused && !prefersStill() && !document.hidden; }
function refreshFilms() {
  document.body.classList.toggle('motion-paused', userMotionPaused || prefersStill() || document.hidden);
  document.body.classList.toggle('experience-motion', manualMotion);
  document.body.classList.toggle('life-motion', !prefersStill());
  films.forEach(film => {
    film.muted = true;
    if (film.dataset.active === 'true' && motionAllowed() && (film !== heroFilm || heroVisible)) {
      film.play().catch(() => {});
    } else film.pause();
  });
  motionButtons.forEach(button => {
    button.hidden = false;
    button.textContent = (userMotionPaused || prefersStill()) ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(userMotionPaused || prefersStill()));
  });
  if (!hasOpened) {
    const still = prefersStill();
    openButton.querySelector('span:first-child').textContent = still ? 'Play full experience' : 'Enter our celebration';
    openButton.setAttribute('aria-label', still ? 'Play full experience' : 'Open your invitation');
    enterStill.hidden = !still;
  }
}
function activateFilms(active) {
  films.forEach(film => { film.dataset.active = String(active.includes(film)); });
  refreshFilms();
}
function syncHeroFilm() {
  heroFilm.dataset.active = 'true';
  if (!heroSynced && heroFilm.readyState >= 1) {
    try {
      heroFilm.currentTime = hallFilm.currentTime || 0;
      heroSynced = true;
    } catch (_) { /* The poster remains visible until metadata is available. */ }
  }
  refreshFilms();
}
heroFilm.addEventListener('loadedmetadata', () => {
  if (hasOpened && !heroSynced) syncHeroFilm();
});
motionButtons.forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  if (prefersStill()) { manualMotion = true; userMotionPaused = false; }
  else userMotionPaused = !userMotionPaused;
  if (hasOpened && userMotionPaused) document.body.classList.add('welcome-complete');
  refreshFilms();
}));
document.addEventListener('visibilitychange', refreshFilms);
const filmObserver = new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  refreshFilms();
}, {threshold:0});
filmObserver.observe(document.querySelector('main'));
activateFilms([openingFilm]);
function lockInvitation(locked) {
  document.body.classList.toggle('locked', locked);
  content.forEach(element => { element.inert = locked; });
}
function cancelEntrance() {
  entranceTimers.forEach(clearTimeout);
  entranceTimers = [];
  entranceAnimations.forEach(animation => animation.cancel());
  entranceAnimations = [];
}
function animateEntrance(element, frames, duration, delay = 0, easing = 'linear') {
  const animation = element.animate(frames, {duration, delay, easing, fill:'both'});
  entranceAnimations.push(animation);
  return animation;
}
function finishEntrance() {
  entranceRun++;
  cancelEntrance();
  opening.hidden = true;
  document.getElementById('entrance-skip').hidden = true;
  journey.hidden = true;
  syncHeroFilm();
  activateFilms([heroFilm]);
  document.body.classList.remove('travelling');
  document.body.classList.add('revealing');
  lockInvitation(false);
  document.getElementById('names').focus({preventScroll:true});
  const settledRun = entranceRun;
  entranceTimers.push(setTimeout(() => {
    if (settledRun === entranceRun) document.body.classList.add('welcome-complete');
  }, 2200));
}
lockInvitation(true);
async function revealInvitation() {
  if (hasOpened) return;
  hasOpened = true;
  if (prefersStill()) { manualMotion = true; userMotionPaused = false; refreshFilms(); }
  const run = ++entranceRun;
  document.getElementById('entrance-skip').hidden = false;
  opening.classList.add('departing');
  opening.inert = true;
  activateFilms([openingFilm]);
  animateEntrance(opening.querySelector('.opening-camera'), [
    {transform:'scale(1)'},
    {transform:'scale(1.18)',offset:.6},
    {transform:'scale(1.38)'}
  ], 2800, 0, 'cubic-bezier(.22,.46,.24,1)');
  animateEntrance(opening.querySelector('.opening-bloom'), [{opacity:0},{opacity:.36}], 2400);
  entranceTimers.push(setTimeout(() => { if (run === entranceRun) revealPalace(); }, 2500));
}

function revealPalace() {
  const run = ++entranceRun;
  // Reveal the names immediately after the original photograph's push-in.
  syncHeroFilm();
  activateFilms([openingFilm, heroFilm]);
  document.body.classList.add('revealing');
  animateEntrance(opening, [{opacity:1},{opacity:0}], 1300, 0, 'ease-in-out');
  entranceTimers.push(setTimeout(() => {
    if (run === entranceRun) finishEntrance();
  }, 1300));
}
openButton.addEventListener('click', revealInvitation);
document.getElementById('entrance-skip').addEventListener('click', finishEntrance);
enterStill.addEventListener('click', event => {
  event.stopPropagation();
  hasOpened = true; manualMotion = false; userMotionPaused = true;
  refreshFilms(); finishEntrance();
});
skipButton.addEventListener('click', finishEntrance);
reduceMotion.addEventListener('change', event => {
  manualMotion = false;
  if (event.matches && hasOpened && (!journey.hidden || (hasOpened && !opening.hidden))) finishEntrance();
  refreshFilms();
});
document.getElementById('replay').addEventListener('click', () => {
  entranceRun++;
  cancelEntrance();
  hasOpened = false;
  document.getElementById('entrance-skip').hidden = true;
  heroSynced = false;
  if (!player.hidden) toggleMusic(false);
  window.scrollTo({top:0,behavior:'instant'});
  document.body.classList.remove('revealing','travelling','welcome-complete');
  journey.hidden = true;
  opening.hidden = false;
  opening.inert = false;
  opening.classList.remove('opened','departing');
  openButton.removeAttribute('aria-busy');
  openButton.querySelector('span:first-child').textContent = 'Enter our celebration';
  activateFilms([openingFilm]);
  lockInvitation(true);
  openButton.focus({preventScroll:true});
});
document.getElementById('names').setAttribute('tabindex','-1');
document.getElementById('print').addEventListener('click', () => window.print());
const music = document.getElementById('music');
const player = document.getElementById('player');
const youtube = document.getElementById('youtube');
function toggleMusic(show) {
  player.hidden = !show;
  music.setAttribute('aria-expanded', String(show));
  if (show) {
    youtube.src = 'https://www.youtube.com/embed/DIV_I5V2mS8?rel=0';
    document.getElementById('close-music').focus();
  } else {
    youtube.src = '';
    music.focus();
  }
}
music.addEventListener('click', () => toggleMusic(player.hidden));
document.getElementById('close-music').addEventListener('click', () => toggleMusic(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && (!journey.hidden || (hasOpened && !opening.hidden))) finishEntrance();
  else if (event.key === 'Escape' && !player.hidden) toggleMusic(false);
});

// The page stays in one palace; scrolling changes depth and dragging changes the view.
const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const chapters = [...document.querySelectorAll('main .chapter')];
const chapterRatios = new Map(chapters.map(chapter => [chapter.id, 0]));
const chapterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    chapterRatios.set(entry.target.id, entry.intersectionRatio);
    entry.target.classList.toggle('chapter-visible', entry.isIntersecting);
  });
  const active = [...chapterRatios].sort((a,b) => b[1]-a[1])[0][0];
  chapterLinks.forEach(link => {
    if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const index = chapters.findIndex(chapter => chapter.id === active);
  document.querySelector('.mobile-guidance').textContent = index === 2 ? 'Drag sideways to look around' : 'Swipe up to explore';
  document.body.style.setProperty('--chapter-zoom', [1.14,1.22,1.31][index]);
}, {threshold:[0,.15,.3,.45,.6,.75,.9,1]});
chapters.forEach(chapter => chapterObserver.observe(chapter));
const air = document.getElementById('living-air');
// A modest increase; petals stay beneath the invitation reading surfaces.
for (let i=0; i<24; i++) {
  const petal = document.createElement('i');
  petal.className = 'air-petal';
  const size = i%5===0 ? 20 : 8+(i*7%8);
  petal.style.cssText = `--x:${(i*61+13)%100}%;--size:${size}px;--blur:${i%5===0?1.5:0}px;--opacity:${i%5===0?.38:.56};--duration:${17+i%7*2}s;--delay:${-(i*3.7)}s;--drift:${i%2?-95:110}px`;
  air.append(petal);
}
for (let i=0; i<22; i++) {
  const mote = document.createElement('i');
  mote.className = 'air-mote';
  mote.style.cssText = `--x:${(i*37+8)%100}%;--y:${(i*23+11)%95}%;--size:${i%3===0?3:2}px;--duration:${6+i%5}s;--delay:${-i*.8}s`;
  air.append(mote);
}
let lookX=0, lookY=0, pointerFrame=0, drag=null;
const story = document.querySelector('main');
function canLook() { return hasOpened && journey.hidden && !prefersStill() && !userMotionPaused; }
function paintLook(x,y) {
  lookX = Math.max(-Math.min(60,innerWidth*.04),Math.min(Math.min(60,innerWidth*.04),x));
  lookY = Math.max(-Math.min(48,innerHeight*.04),Math.min(Math.min(48,innerHeight*.04),y));
  if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
    document.body.style.setProperty('--look-x', lookX+'px');
    document.body.style.setProperty('--look-y', lookY+'px');
    pointerFrame=0;
  });
}
story.style.touchAction = 'pan-y';
story.addEventListener('pointerdown', event => {
  if (!canLook() || event.button!==0 || event.target.closest('a,button,input,iframe')) return;
  drag = {id:event.pointerId,x:event.clientX,y:event.clientY,lookX,lookY,type:event.pointerType};
  if (event.pointerType==='mouse') event.preventDefault();
  story.setPointerCapture(event.pointerId);
});
window.addEventListener('pointermove', event => {
  if (!canLook()) return;
  if (drag && drag.id===event.pointerId) {
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if (drag.type==='touch' && Math.abs(dy)>Math.abs(dx)*1.2) return;
    document.body.classList.add('dragging-scene');story.classList.add('is-dragging');
    paintLook(drag.lookX+dx*.22,drag.lookY+(drag.type==='touch'?0:dy*.18));
  } else if(event.pointerType==='mouse') {
    paintLook((event.clientX/innerWidth-.5)*16,(event.clientY/innerHeight-.5)*12);
  }
}, {passive:true});
function releaseLook() {
  drag=null;document.body.classList.remove('dragging-scene');story.classList.remove('is-dragging');
}
window.addEventListener('pointerup',releaseLook);
window.addEventListener('pointercancel',releaseLook);

// Move the original photograph gently with the viewer, without changing the couple.
opening.addEventListener('pointermove', event => {
  if (hasOpened || !motionAllowed() || event.pointerType === 'touch') return;
  opening.style.setProperty('--photo-x', `${(event.clientX / innerWidth - .5) * 12}px`);
  opening.style.setProperty('--photo-y', `${(event.clientY / innerHeight - .5) * 8}px`);
});
opening.addEventListener('pointerleave', () => {
  opening.style.setProperty('--photo-x','0px');
  opening.style.setProperty('--photo-y','0px');
});

// Countdown uses the confirmed Nikah time in India, independent of the guest's timezone.
const nikahTime = Date.parse('2026-11-15T19:00:00+05:30');
function updateCountdown() {
  if (document.hidden) return;
  const remaining = Math.max(0, Math.floor((nikahTime - Date.now()) / 1000));
  const values = [Math.floor(remaining/86400), Math.floor(remaining/3600)%24, Math.floor(remaining/60)%60, remaining%60];
  ['days','hours','minutes','seconds'].forEach((unit,index) => {
    document.getElementById('count-'+unit).textContent = String(values[index]).padStart(2,'0');
  });
  if (!remaining) document.querySelector('#countdown>p').textContent = 'Our wedding day is here';
}
updateCountdown();
setInterval(updateCountdown,1000);

// Guest names are displayed as text; each link carries its own invitation name.
function cleanGuest(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80);
}
const invitedGuest = cleanGuest(new URLSearchParams(location.search).get('guest'));
if (invitedGuest) {
  const greeting = document.getElementById('guest-greeting');
  greeting.textContent = 'Dear ' + invitedGuest + ',';
  greeting.hidden = false;
  document.getElementById('personal-closing').textContent = invitedGuest + ', we would love to celebrate this beautiful beginning with you.';
  document.getElementById('gift-name').value = invitedGuest;
}
// Individual invitations arrive with the guest's scroll, rather than all at once.
const eventReveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('event-arrived');
    eventReveal.unobserve(entry.target);
  });
}, {threshold:.12});
document.querySelectorAll('.event').forEach(event => eventReveal.observe(event));
