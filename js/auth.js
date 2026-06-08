import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 30;
const SALT = 'dailyenglish_salt_2024';

let currentPin = '';
let setupStep = 'first'; // 'first' | 'confirm'
let firstPin = '';
let attempts = 0;

async function hashPIN(pin) {
  const data = new TextEncoder().encode(pin + SALT);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getConfig() {
  const { data } = await client.from('user_config').select('*').eq('id', 1).maybeSingle();
  return data;
}

function buildNumpad(containerId, onKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const keys = ['1','2','3','4','5','6','7','8','9','empty','0','⌫'];
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'numpad-key' + (k === '0' ? ' zero' : '') + (k === '⌫' ? ' backspace' : '') + (k === 'empty' ? ' empty' : '');
    btn.textContent = k === 'empty' ? '' : k;
    if (k !== 'empty') {
      btn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(10);
        onKey(k);
      });
    }
    container.appendChild(btn);
  });
}

function updateDots(dotsId, pin) {
  const dots = document.querySelectorAll(`#${dotsId} .pin-dot`);
  dots.forEach((d, i) => d.classList.toggle('filled', i < pin.length));
}

function showMessage(id, msg, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-message' + (type ? ` ${type}` : '');
}

function shakeError(dotsId) {
  const wrap = document.getElementById(dotsId);
  if (!wrap) return;
  wrap.classList.add('error', 'shake');
  setTimeout(() => wrap.classList.remove('shake', 'error'), 600);
}

// ---- LOCK ----
function startLock() {
  const overlay = document.getElementById('lock-overlay');
  const countdown = document.getElementById('lock-countdown');
  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('visible'), 10);
  let secs = LOCK_SECONDS;
  countdown.textContent = secs;
  const t = setInterval(() => {
    secs--;
    countdown.textContent = secs;
    if (secs <= 0) {
      clearInterval(t);
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
      attempts = 0;
      currentPin = '';
      updateDots('login-dots', '');
      showMessage('login-msg', '');
    }
  }, 1000);
}

// ---- SETUP FLOW ----
function initSetup() {
  document.getElementById('setup-section').style.display = 'flex';
  document.getElementById('login-section').style.display = 'none';

  buildNumpad('setup-numpad', key => {
    if (key === '⌫') {
      currentPin = currentPin.slice(0, -1);
    } else if (currentPin.length < 4) {
      currentPin += key;
    }
    updateDots('setup-dots', currentPin);
    if (currentPin.length === 4) onSetupFull();
  });
}

async function onSetupFull() {
  if (setupStep === 'first') {
    firstPin = currentPin;
    currentPin = '';
    setupStep = 'confirm';
    document.getElementById('setup-title').textContent = 'Confirme seu PIN';
    document.getElementById('setup-hint').textContent = 'Digite o PIN novamente';
    updateDots('setup-dots', '');
    showMessage('setup-msg', '');
  } else {
    if (currentPin !== firstPin) {
      shakeError('setup-dots');
      showMessage('setup-msg', 'PINs diferentes. Tente novamente.', 'error');
      currentPin = '';
      firstPin = '';
      setupStep = 'first';
      document.getElementById('setup-title').textContent = 'Crie seu PIN de acesso';
      document.getElementById('setup-hint').textContent = 'Digite um PIN de 4 dígitos';
      updateDots('setup-dots', '');
      return;
    }
    const hash = await hashPIN(currentPin);
    const { error } = await client.from('user_config').insert({ id: 1, pin_hash: hash });
    if (error) {
      showMessage('setup-msg', 'Erro ao salvar PIN. Tente novamente.', 'error');
      return;
    }
    showMessage('setup-msg', 'PIN criado! Entrando...', 'success');
    setTimeout(() => { window.location.href = 'app.html'; }, 800);
  }
}

// ---- LOGIN FLOW ----
function initLogin(config) {
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('setup-section').style.display = 'none';

  const bioBtn = document.getElementById('bio-btn');
  if (config.webauthn_credential_id) {
    bioBtn.classList.remove('hidden');
    bioBtn.addEventListener('click', () => verifyBiometric(config.webauthn_credential_id));
  } else {
    bioBtn.classList.add('hidden');
    if (window.PublicKeyCredential) {
      const registerBtn = document.createElement('button');
      registerBtn.id = 'bio-register-btn';
      registerBtn.className = 'biometric-btn';
      registerBtn.style.fontSize = '13px';
      registerBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M12 1a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"/>
          <path d="M3 12c0-2 1-4 2.5-5.5M21 12c0-2-1-4-2.5-5.5"/>
          <path d="M7 19c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
        </svg>
        Cadastrar digital / FaceID`;
      registerBtn.addEventListener('click', registerBiometric);
      bioBtn.insertAdjacentElement('afterend', registerBtn);
    }
  }

  buildNumpad('login-numpad', key => {
    if (attempts >= MAX_ATTEMPTS) return;
    if (key === '⌫') {
      currentPin = currentPin.slice(0, -1);
    } else if (currentPin.length < 4) {
      currentPin += key;
    }
    updateDots('login-dots', currentPin);
    if (currentPin.length === 4) onLoginFull(config);
  });
}

async function onLoginFull(config) {
  const hash = await hashPIN(currentPin);
  if (hash === config.pin_hash) {
    showMessage('login-msg', 'Correto! Entrando...', 'success');
    attempts = 0;
    setTimeout(() => { window.location.href = 'app.html'; }, 500);
  } else {
    attempts++;
    shakeError('login-dots');
    currentPin = '';
    updateDots('login-dots', '');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if (attempts >= MAX_ATTEMPTS) {
      startLock();
    } else {
      showMessage('login-msg', `PIN incorreto. ${MAX_ATTEMPTS - attempts} tentativa(s) restante(s).`, 'error');
    }
  }
}

// ---- WEBAUTHN ----
async function registerBiometric() {
  if (!window.PublicKeyCredential) {
    showMessage('login-msg', 'Biometria não suportada neste dispositivo.', 'error');
    return;
  }
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'DailyEnglish', id: location.hostname },
        user: { id: new Uint8Array(16), name: 'user', displayName: 'Usuário' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { userVerification: 'preferred', residentKey: 'discouraged' },
        timeout: 60000
      }
    });
    if (!credential) return;
    const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    const { error } = await client.from('user_config')
      .update({ webauthn_credential_id: credId })
      .eq('id', 1);
    if (error) {
      showMessage('login-msg', 'Erro ao salvar biometria.', 'error');
      return;
    }
    showMessage('login-msg', 'Biometria cadastrada! Use-a no próximo acesso.', 'success');
    document.getElementById('bio-btn').classList.remove('hidden');
    document.getElementById('bio-register-btn')?.remove();
  } catch (e) {
    if (e.name !== 'NotAllowedError') {
      showMessage('login-msg', 'Erro ao cadastrar biometria.', 'error');
    }
  }
}

async function verifyBiometric(credentialId) {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: 'public-key', id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)) }],
        userVerification: 'preferred',
        timeout: 60000
      }
    });
    if (assertion) {
      showMessage('login-msg', 'Biometria confirmada!', 'success');
      setTimeout(() => { window.location.href = 'app.html'; }, 500);
    }
  } catch {
    showMessage('login-msg', 'Biometria falhou. Use o PIN.', 'error');
  }
}

// ---- INIT ----
(async () => {
  try {
    const config = await getConfig();
    if (config) {
      initLogin(config);
    } else {
      initSetup();
    }
  } catch {
    initSetup();
  }
})();
