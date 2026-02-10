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

  let expr = '';
  let memory = null;
  let isSoundOn = false;
  let isHapticOn = true;
  let audioCtx = null;

  // STARTUP
  setTimeout(() => {
    startupGate.classList.add('gate-hidden');
    calc.classList.add('shell-visible');
  }, 1000);

  function haptic(ms = 15) {
    if (isHapticOn && navigator.vibrate) navigator.vibrate(ms);
  }

  function playTick() {
    if (!isSoundOn) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 600;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function safeEvaluate(input) {
    try {
      let exp = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const res = Function('return ' + exp)();
      if (!isFinite(res)) return 'Error';
      return +res.toPrecision(10);
    } catch {
      return 'Error';
    }
  }

  // KEYPAD
  pad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    haptic();
    playTick();

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'equals') {
      if (!expr) return;
      const res = safeEvaluate(expr);
      resultEl.textContent = res;
      expr = String(res);
      expressionEl.classList.add('gone');
      return;
    }

    expressionEl.classList.remove('gone');

    if (action === 'clear') {
      expr = '';
      resultEl.textContent = '0';
    } else if (action === 'delete') {
      expr = expr.slice(0, -1);
    } else if (action === 'mem-plus') {
      if (expr) {
        memory = safeEvaluate(expr);
        memoryDot.classList.add('active');
      }
    } else if (val) {
      expr += val;
    }

    expressionEl.textContent = expr;
  });

  // MENU
  menuBtn.addEventListener('click', () => {
    haptic();
    playTick();
    modalBackdrop.classList.add('open');
  });
  closeModalBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) modalBackdrop.classList.remove('open'); });

  // TOGGLES
  soundSwitch.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    soundSwitch.classList.toggle('on', isSoundOn);
    if (isSoundOn) playTick();
    else haptic(10);
  });
  hapticSwitch.addEventListener('click', () => {
    isHapticOn = !isHapticOn;
    hapticSwitch.classList.toggle('on', isHapticOn);
    if (isHapticOn) haptic(30);
    else if (isSoundOn) playTick();
  });

});
