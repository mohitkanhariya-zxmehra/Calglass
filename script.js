document.addEventListener('DOMContentLoaded', () => {
  const startupGate = document.getElementById('startupGate');
  const calc = document.getElementById('calc');
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const memDot = document.getElementById('memDot');
  const pad = document.getElementById('pad');

  const menuBtn = document.getElementById('menuBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModal');
  const soundSwitch = document.getElementById('soundSwitch');
  const hapticSwitch = document.getElementById('hapticSwitch');

  let expr = '';
  let memory = 0;
  let isSoundOn = false;
  let isHapticOn = true;
  let audioCtx = null;

  // STARTUP
  setTimeout(() => {
    startupGate.classList.add('gate-hidden');
    calc.classList.add('shell-visible');
  }, 1000);

  // HAPTIC
  function triggerHaptic(ms = 15) {
    if (isHapticOn && navigator.vibrate) navigator.vibrate(ms);
  }

  // SOUND
  function playTick() {
    if (!isSoundOn) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  // SAFE EVAL
  function safeEvaluate(input) {
    try {
      const sanitized = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const val = new Function('return (' + sanitized + ')')();
      if (!isFinite(val)) return 'Error';
      return Number(Number(val).toPrecision(10));
    } catch { return 'Error'; }
  }

  // KEYPAD
  pad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    triggerHaptic();
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

    switch (action) {
      case 'clear':
        expr = '';
        resultEl.textContent = '0';
        break;
      case 'delete':
        expr = expr.slice(0, -1);
        break;
      case 'plusminus':
        if (expr) expr = expr.startsWith('-') ? expr.slice(1) : '-' + expr;
        break;
      case 'mem-plus':
        memory = Number(resultEl.textContent);
        memDot.classList.add('active');
        break;
      default:
        if (val) expr += val;
    }
    expression
