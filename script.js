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

  let expr = '';
  let memory = null;
  let audioCtx = null;
  let isSoundOn = false;
  let isHapticOn = true;

  setTimeout(() => { startupGate.classList.add('gate-hidden'); calc.classList.add('shell-visible'); }, 1000);

  function haptic(ms=10){ if(isHapticOn && navigator.vibrate) navigator.vibrate(ms); }
  function playTick(){ if(!isSoundOn) return; if(!audioCtx) audioCtx=new AudioContext(); const osc=audioCtx.createOscillator(); const gain=audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.frequency.value=600; gain.gain.value=0.05; osc.start(); osc.stop(audioCtx.currentTime+0.05); }
  function safeEvaluate(input){ try{ const result=Function('return '+input.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))(); if(!isFinite(result)) return 'Error'; return +result.toPrecision(10); } catch{return 'Error';} }

  pad.addEventListener('click', e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    haptic(); playTick();
    const val=btn.dataset.value; const action=btn.dataset.action;
    switch(action){
      case 'clear': expr=''; expressionEl.textContent=''; resultEl.textContent='0'; expressionEl.classList.remove('gone'); break;
      case 'delete': expr=expr.slice(0,-1); break;
      case 'plusminus': if(expr) expr=expr.startsWith('-')?expr.slice(1):'-'+expr; break;
      case 'mem-plus': memory=parseFloat(resultEl.textContent)||0; break;
      case 'equals': if(!expr) return; const res=safeEvaluate(expr); expressionEl.classList.add('gone'); setTimeout(()=>{ resultEl.textContent=res; expr=String(res); },100); return;
      default: if(val) expr+=val;
    }
    expressionEl.textContent=expr; if(expr) expressionEl.classList.remove('gone');
  });

  menuBtn.addEventListener('click', ()=>{ haptic(); modalBackdrop.classList.add('open'); });
  closeModalBtn.addEventListener('click', ()=>{ haptic(); modalBackdrop.classList.remove('open'); });
  modalBackdrop.addEventListener('click', e=>{ if(e.target===modalBackdrop) modalBackdrop.classList.remove('open'); });

  soundSwitch.addEventListener('click', ()=>{ isSoundOn=!isSoundOn; soundSwitch.classList.toggle('on',isSoundOn); if(isSoundOn) playTick(); });
  hapticSwitch.addEventListener('click', ()=>{ isHapticOn=!isHapticOn; hapticSwitch.classList.toggle('on',isHapticOn); if(isHapticOn) haptic(30); });
});
