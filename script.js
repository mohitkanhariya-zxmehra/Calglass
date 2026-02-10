document.addEventListener('DOMContentLoaded', () => {

  const startupGate = document.getElementById('startupGate');
  const calc = document.getElementById('calc');
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const pad = document.getElementById('pad');

  let expr = '';
  let audioCtx = null;

  // Startup animation
  setTimeout(() => {
    startupGate.classList.add('gate-hidden');
    calc.classList.add('shell-visible');
  }, 1000);

  // Haptic
  function haptic(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  // Sound (optional safe)
  function playTick() {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 600;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  // Safe math evaluation
  function safeEvaluate(input) {
    try {
      let exp = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/√/g, 'Math.sqrt');

      const result = Function('return ' + exp)();
      if (!isFinite(result)) return 'Error';
      return +result.toPrecision(10);
    } catch {
      return 'Error';
    }
  }

  pad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    haptic();
    playTick();

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'equals') {
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

      case 'sin':
        expr += 'sin(';
        break;

      case 'cos':
        expr += 'cos(';
        break;

      case 'tan':
        expr += 'tan(';
        break;

      case 'sqrt':
        expr += '√(';
        break;

      case 'square':
        expr += '**2';
        break;

      default:
        if (val) expr += val;
    }

    expressionEl.textContent = expr;
  });

});
