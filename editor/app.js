import {initStrudel, evaluate, hush, getAudioContext, samples} from './vendor/strudel/index.mjs';
const $ = (id) => document.getElementById(id);
const presets = {
  pulse: '// Night pulse · a warm, steady bassline\nnote("c2 ~ c2 eb2 ~ g2 ~ bb1")\n  .s("triangle")\n  .decay(0.18).sustain(0)\n  .lpf(800).gain(0.55)',
  drift: '// Soft drift · let each note breathe\nnote("<c4 eb4 g4 bb4>")\n  .s("sine")\n  .attack(0.06).release(0.5)\n  .gain(0.35).slow(2)',
  spark: '// Spark steps · bright notes in motion\nnote("c4 eb4 g4 bb4 g4 eb4 d4 g4")\n  .s("triangle")\n  .decay(0.12).sustain(0)\n  .lpf(2200).gain(0.3)'
};
const grooves = {
  midnight: {bpm:126, tip:'House: change c2 to f2 in the bass line for a darker turn.', code:`// Midnight drive · four-on-the-floor house
stack(
  s("mb_kick*4").gain(0.85),
  s("~ mb_clap ~ mb_clap").gain(0.65),
  s("[~ mb_hat]*4").gain(0.5),
  note("c2 ~ c2 [eb2 g2] ~ c2 bb1 ~")
    .s("sawtooth").lpf(550).decay(0.12).sustain(0).gain(0.24),
  note("<c4,eb4,g4> ~ ~ ~").s("triangle")
    .decay(0.18).sustain(0).gain(0.18)
)`},
  concrete: {bpm:92, tip:'Hip-hop: change mb_hat*8 to mb_hat*16 for busier hats.', code:`// Concrete pocket · head-nod hip-hop
stack(
  s("mb_kick ~ [~ mb_kick] ~ mb_kick ~ ~ ~").gain(0.85),
  s("~ mb_snare ~ mb_snare").gain(0.7),
  s("mb_hat*8").gain("0.4 0.2 0.3 0.2"),
  note("c2 ~ ~ eb2 ~ g1 bb1 ~").s("sine")
    .decay(0.3).sustain(0).gain(0.65),
  note("<eb4 g4 bb4 g4>").s("triangle")
    .decay(0.14).sustain(0).gain(0.18)
)`},
  warehouse: {bpm:138, tip:'Techno: raise lpf(650) to lpf(1800) to open the bass sound.', code:`// Warehouse lights · driving techno
stack(
  s("mb_kick*4").gain(0.9),
  s("[~ mb_hat]*4").gain(0.45),
  s("~ mb_clap ~ mb_clap").gain(0.45),
  note("c2 c3 c2 [c2 eb2] c2 c3 bb1 c2")
    .s("sawtooth").lpf(650).resonance(8)
    .decay(0.08).sustain(0).gain(0.22)
)`},
  neon: {bpm:112, tip:'Electro: change triangle to square for a sharper lead.', code:`// Neon arcade · bouncing electro
stack(
  s("mb_kick ~ mb_kick ~").gain(0.85),
  s("~ mb_snare ~ mb_snare").gain(0.65),
  s("mb_hat*8").gain(0.3),
  note("c2 ~ c3 bb1 ~ eb2 g2 ~").s("sawtooth")
    .lpf(700).decay(0.14).sustain(0).gain(0.23),
  note("c5 eb5 g5 bb5 g5 eb5 d5 bb4").s("triangle")
    .decay(0.09).sustain(0).gain(0.16)
)`}
};
for (const [name, groove] of Object.entries(grooves)) presets[name] = groove.code;
let engine, busy = false, playing = false, generation = 0, evalError;
function message(text, error = false) { $('message').textContent = text; $('message').classList.toggle('error', error); }
function persist() {
  try { localStorage.setItem('mouthbeat.draft.v1', JSON.stringify({code:$('code').value, tempo:$('tempo').value})); $('saved').textContent = 'Draft saved on this device'; }
  catch { $('saved').textContent = 'Storage unavailable · export to keep your work'; }
}
$('code').value = presets.midnight; $('tempo').value = 126;
try { const draft = JSON.parse(localStorage.getItem('mouthbeat.draft.v1')); if (draft && typeof draft.code === 'string') { $('code').value = draft.code; const tempo = Number(draft.tempo); if (tempo >= 30 && tempo <= 240) $('tempo').value = tempo; } } catch {}
function stopped() { playing = false; $('state').textContent = 'Stopped'; $('dot').classList.remove('playing'); $('play').textContent = '▶ Play pattern'; }
function stop() { generation++; if (engine) { hush(); getAudioContext().suspend(); } stopped(); message('Stopped. Your pattern is ready when you are.'); }
async function play() {
  if (busy || !engine) return;
  const bpm = Number($('tempo').value);
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) { message('Choose a tempo between 30 and 240 BPM.', true); return; }
  if (!$('code').value.trim()) { message('Write a pattern or choose a starter first.', true); return; }
  busy = true; $('play').disabled = true; const run = ++generation; evalError = null;
  try {
    await getAudioContext().resume();
    engine.scheduler.setCps(bpm / 240);
    await evaluate($('code').value);
    if (run !== generation) { hush(); await getAudioContext().suspend(); return; }
    if (evalError) throw evalError;
    lastSignature = ''; playing = true; $('state').textContent = 'Playing'; $('dot').classList.add('playing'); $('play').textContent = '↻ Update pattern';
    message('Playing · edit the code and press Update to hear your changes.'); persist();
  } catch(error) { message(`Could not play: ${error.message || error}`, true); if (!playing) stopped(); }
  finally { busy = false; $('play').disabled = false; }
}
$('play').onclick = play; $('stop').onclick = stop;
$('code').addEventListener('input', () => {persist(); lastSignature = ''; renderHighlights([]); if(playing) message('Edits pending · press Update to hear them. Unchanged notes keep highlighting.');}); $('tempo').addEventListener('input', persist);
$('code').addEventListener('keydown', (event) => { if (event.key === 'Tab') { event.preventDefault(); const input = event.target; input.setRangeText('  ',input.selectionStart,input.selectionEnd,'end'); persist(); } });
document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); play(); } if (event.key === 'Escape') stop(); });
for (const button of document.querySelectorAll('[data-preset]')) button.onclick = () => { if (engine) stop(); $('code').value = presets[button.dataset.preset]; if (grooves[button.dataset.preset]) $('tempo').value = grooves[button.dataset.preset].bpm; persist(); message(grooves[button.dataset.preset]?.tip || 'Starter loaded. Press Play to hear it.'); };
$('export').onclick = () => { if(location.hostname === 'appassets.androidplatform.net') { location.href='mouthbeat://export'; return; } const url = URL.createObjectURL(new Blob([$('code').value],{type:'text/plain'})); const link = document.createElement('a'); link.href = url; link.download = 'mouthbeat-pattern.strudel'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000); message('Pattern exported. Tempo is controlled separately in this prototype.'); };
$('import').onchange = async (event) => { const file = event.target.files[0]; if (!file) return; if (file.size > 100000) { message('Choose a pattern smaller than 100 KB.', true); event.target.value = ''; return; } try { const text = await file.text(); if (engine) stop(); $('code').value = text; persist(); message('Imported. Review the code before pressing Play.'); } catch { message('Could not read that file.', true); } event.target.value = ''; };
window.addEventListener('pagehide', () => { if(engine) hush(); });
try {
  engine = await initStrudel({ prebake: () => samples({mb_kick:'sounds/mb_kick.wav',mb_snare:'sounds/mb_snare.wav',mb_hat:'sounds/mb_hat.wav',mb_clap:'sounds/mb_clap.wav'}, new URL('./', location.href).href), onEvalError: error => { evalError = error; }, onUpdateState: state => { if(state.schedulerError) message(`Playback error: ${state.schedulerError.message || state.schedulerError}`, true); } });
  $('code').disabled = false; $('play').disabled = false; $('stop').disabled = false; stopped(); message('Ready. Press Play to start your first loop.');
} catch(error) { $('state').textContent = 'Engine unavailable'; message(`Engine could not start: ${error.message}`, true); }
if (location.hostname !== 'appassets.androidplatform.net' && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').then(async registration => { await navigator.serviceWorker.ready; $('offline').textContent = 'Offline cache ready · bundled drum sounds'; }).catch(() => { $('offline').textContent = 'Local engine · offline cache unavailable'; });

// Map only unchanged source ranges while a draft differs from the playing code.
// Edited tokens have no honest playback location until Update succeeds.
function locationMapper(active, draft) {
  if (active === draft) return location => location;
  let prefix = 0;
  while (prefix < active.length && prefix < draft.length && active[prefix] === draft[prefix]) prefix++;
  let suffix = 0;
  while (suffix < active.length-prefix && suffix < draft.length-prefix && active[active.length-1-suffix] === draft[draft.length-1-suffix]) suffix++;
  const end = active.length-suffix, delta = draft.length-active.length;
  return location => {
    if (location.end <= prefix) return location;
    if (location.start >= end) return {start:location.start+delta, end:location.end+delta};
    return null;
  };
}
// Use Strudel's evaluated event locations and its audio clock, not a visual metronome.
const overlay = $('code-highlights');
let lastFrame = 0, lastSignature = '';
function renderHighlights(ranges) {
  const code = $('code').value;
  const valid = ranges.filter(r => Number.isInteger(r.start) && Number.isInteger(r.end) && r.start >= 0 && r.end <= code.length && r.end > r.start);
  const boundaries = new Set([0,code.length]);
  for (const range of valid) { boundaries.add(range.start); boundaries.add(range.end); }
  const points = [...boundaries].sort((a,b) => a-b); const nodes = [];
  for (let i=0;i<points.length-1;i++) {
    const start = points[i], end = points[i+1];
    if (valid.some(r => r.start < end && r.end > start)) { const mark = document.createElement('mark'); mark.textContent = code.slice(start,end); nodes.push(mark); }
    else nodes.push(document.createTextNode(code.slice(start,end)));
  }
  nodes.push(document.createTextNode('\n'));
  overlay.replaceChildren(...nodes); overlay.scrollTop = $('code').scrollTop; overlay.scrollLeft = $('code').scrollLeft;
}
$('code').addEventListener('scroll', () => { overlay.scrollTop = $('code').scrollTop; overlay.scrollLeft = $('code').scrollLeft; });
function highlightFrame(time) {
  requestAnimationFrame(highlightFrame);
  if(time-lastFrame < 35) return; lastFrame=time;
  const state = engine?.state;
  if (!playing || !state?.pattern) {
    const signature = 'idle:' + playing + ':' + $('code').value;
    if(lastSignature !== signature) { renderHighlights([]); $('sounding').textContent = playing ? 'Code changed · press Update to sync playback highlights.' : 'Playback highlights will appear in the code.'; lastSignature=signature; }
    return;
  }
  try {
    const now = Math.max(0, engine.scheduler.now());
    const haps = state.pattern.queryArc(now,now+0.00001);
    const mapLocation = locationMapper(state.activeCode, $('code').value);
    const ranges = haps.flatMap(hap => hap.context.locations || []).map(mapLocation).filter(Boolean);
    const dirty = $('code').value !== state.activeCode;
    const signature = JSON.stringify([$('code').value, ranges]);
    if(signature === lastSignature) return; lastSignature=signature;
    renderHighlights(ranges);
    const panel = $('sounding');
    if (!panel.querySelector('button')) { panel.replaceChildren(); const label = document.createElement('span'); label.textContent='HEARING NOW ·'; panel.append(label); }
    panel.querySelector('span').textContent = dirty ? 'PLAYING PREVIOUS VERSION · UPDATE TO HEAR EDITS' : 'HEARING NOW ·';
    for(const button of panel.querySelectorAll('button')) button.style.opacity='0.4';
    for(const hap of haps) {
      const value = hap.value;
      const voice = String(value.s || 'note');
      let button = [...panel.querySelectorAll('button')].find(b => b.dataset.voice === voice);
      if(!button) { button=document.createElement('button'); button.dataset.voice=voice; panel.append(button); }
      button.textContent = [value.s, value.note].filter(v => v !== undefined).join(' · ');
      button.style.opacity='1'; button.title='Select this event in the code';
      const location = (hap.context.locations || []).map(mapLocation).find(Boolean);
      button.onclick=()=> { if(location) { $('code').focus(); $('code').setSelectionRange(location.start,location.end); } };
    }
  } catch { $('sounding').textContent='Highlighting unavailable for this pattern.'; }
}
renderHighlights([]); requestAnimationFrame(highlightFrame);
