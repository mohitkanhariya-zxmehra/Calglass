document.addEventListener('DOMContentLoaded', () => {

  const startupGate = document.getElementById('startupGate');
  const calc = document.getElementById('calc');
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const pad = document.getElementById('pad');
  const memoryDot = document.getElementById('memoryDot');

  const menuBtn = document.getElementById('menuBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModal');
  const soundSwitch = document.getElementById('soundSwitch');
  const hapticSwitch = document.getElementById('hapticSwitch');
  const memoryToggle = document.getElementById('memoryToggle');

  let expr = '';
  let memory = null;
  let audioCtx = null;
  let isSoundOn = false;
  let isHapticOn = true;

  // Startup animation
  calc.classList.add('shell-visible');
  setTimeout(() => startupGate.classList.add('gate-hidden'), 1000);

  function haptic(ms = 15) { if (isHapticOn && navigator.vibrate) navigator.vibrate(ms); }
  function playTick() { if (!isSoundOn) return; if (!audioCtx) audioCtx = new AudioContext(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.frequency.value = 600; gain.gain.value = 0.05; osc.start(); osc.stop(audioCtx.currentTime + 0.05); }

  function safeEvaluate(input) {
    try {
      const val = Function('return ' + input.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))();
      if (!isFinite(val)) return 'Error';
      return +val.toPrecision(10);
    } catch { return 'Error'; }
  }

  function updateMemoryDot() { memoryDot.classList.toggle('active', memory !== null); }

  pad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    haptic(); playTick();

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'equals') {
      if (!expr) return;
      const result = safeEvaluate(expr);
      resultEl.textContent = result;
      expr = String(result);
      return;
    }

    if (action === 'clear') { expr = ''; resultEl.textContent = '0'; return; }

    if (action === 'delete') { expr = expr.slice(0,-1); }
    else if (action === 'plusminus') { if(expr) expr = expr.startsWith('-')? expr.slice(1) : '-' + expr; }
    else if (action === 'mem-plus') { memory = resultEl.textContent; updateMemoryDot(); }
    else if (val !== undefined) { expr += val; }

    expressionEl.textContent = expr;

    if (memoryToggle.checked && memory !== null) resultEl.textContent = memory;
  });

  // Menu
  menuBtn.addEventListener('click', () => { modalBackdrop.classList.add('open'); haptic(); playTick(); });
  closeModalBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  modalBackdrop.addEventListener('click', (e) => { if(e.target === modalBackdrop) modalBackdrop.classList.remove('open'); });

  soundSwitch.addEventListener('change', () => { isSoundOn = soundSwitch.checked; if(isSoundOn) playTick(); });
  hapticSwitch.addEventListener('change', () => { isHapticOn = hapticSwitch.checked; if(isHapticOn) haptic(30); });
});
