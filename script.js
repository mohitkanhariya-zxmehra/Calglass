document.addEventListener('DOMContentLoaded', () => {

  const startupGate = document.getElementById('startupGate');
  const calc = document.getElementById('calc');
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const pad = document.getElementById('pad');

  const menuBtn = document.getElementById('menuBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModal');
  const soundSwitch = document.getElementById('soundSwitch');
  const hapticSwitch = document.getElementById('hapticSwitch');

  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');

  let expr = '';
  let memory = 0;
  let audioCtx = null;
  let isSoundOn = false;
  let isHapticOn = true;

  // Startup animation
  setTimeout(() => {
    startupGate.classList.add('gate-hidden');
    calc.classList.add('shell-visible');
  }, 1000);

  // Haptic
  function haptic(ms = 10) { if (isHapticOn && navigator.vibrate) navigator.vibrate(ms); }

  // Sound
  function playTick() {
    if (!isSoundOn) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 600; gain.gain.value = 0.05;
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
  }

  // Safe math
  function safeEvaluate(input) {
    try {
      const sanitized = input.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
      const val = Function('return (' + sanitized + ')')();
      if (!isFinite(val)) return 'Error';
      return +val.toPrecision(10);
    } catch { return 'Error'; }
  }

  // KEYPAD
  pad.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    haptic(); playTick();

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'equals') {
      const res = safeEvaluate(expr);
      resultEl.textContent = res;
      historyList.insertAdjacentHTML('afterbegin', `<li>${expr} = ${res}</li>`);
      expr = String(res); expressionEl.classList.add('gone');
      return;
    }

    expressionEl.classList.remove('gone');

    switch(action){
      case 'clear': expr=''; resultEl.textContent='0'; break;
      case 'delete': expr=expr.slice(0,-1
