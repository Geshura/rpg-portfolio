// Smooth scroll for anchor links and mailto form handler
document.addEventListener('DOMContentLoaded', function(){
  /* --- Particle background --- */
  (function(){
    var canvas = document.getElementById('bg-canvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = window.devicePixelRatio || 1;
    var w, h, particles;
    window.particlesEnabled = true;
    var mouseTrail = [];
    var mouseX = 0, mouseY = 0;
    var tentacleSeeds = Array.from({length: 12}, function(_, i){ return Math.random()*Math.PI*2 + i*0.3; });

    function resize(){
      w = canvas.width = Math.max(300, window.innerWidth * DPR);
      h = canvas.height = Math.max(300, window.innerHeight * DPR);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      initParticles();
    }

    function rand(min,max){return Math.random()*(max-min)+min}

    function initParticles(){
      var count = Math.round(Math.max(40, window.innerWidth/18));
      particles = [];
      for(var i=0;i<count;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          vx: rand(-0.25,0.25),
          vy: rand(-0.1,0.1),
          r: rand(0.7,2.6),
          life: rand(0,1)
        });
      }
    }

    // Mouse tracking
    document.addEventListener('mousemove', function(e){
      mouseX = e.clientX * DPR;
      mouseY = e.clientY * DPR;
      mouseTrail.push({x: mouseX, y: mouseY, life: 1});
      if(mouseTrail.length > 20) mouseTrail.shift();
    });

    function drawMouseEffects(){
      var theme = document.body.getAttribute('data-theme');
      
      if(theme === 'post-apo'){
        // Post-Apo: Ogromne fale/sonar wypychające cząstki od kursora
        ctx.globalCompositeOperation = 'lighter';
        
        // Pulsujące, drobniejsze kręgi lecące bardzo daleko (sonar)
        var t = (Date.now() % 5200) / 5200; // 0..1
        for(var i=0; i<4; i++){
          var radius = (40 + i*60 + t*1400) * DPR;
          var alpha = Math.max(0, 0.26 - i*0.05 - t*0.18);
          ctx.strokeStyle = 'rgba(255,153,68,'+(alpha)+')';
          ctx.lineWidth = Math.max(1.4, (3.6 - i*0.6)) * DPR;
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, radius, 0, Math.PI*2);
          ctx.stroke();
        }
        
        // Odpychanie cząstek od kursora
        particles.forEach(function(p){
          var dx = p.x - mouseX;
          var dy = p.y - mouseY;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 460*DPR && dist > 0){
            var force = (460*DPR - dist) / (460*DPR);
            p.vx += (dx/dist) * force * 0.52;
            p.vy += (dy/dist) * force * 0.52;
          }
        });
      }
      
      if(theme === 'cyberpunk'){
        // Cyberpunk: Świecące linie grid reagujące na kursor
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(0,255,255,0.3)';
        ctx.lineWidth = 2 * DPR;
        
        // Vertical lines
        for(var x = 0; x < w; x += 60*DPR){
          var dist = Math.abs(x - mouseX);
          if(dist < 200*DPR){
            var alpha = 1 - (dist / (200*DPR));
            ctx.strokeStyle = 'rgba(0,255,255,'+(alpha*0.4)+')';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
        }
        
        // Horizontal lines
        for(var y = 0; y < h; y += 60*DPR){
          var dist = Math.abs(y - mouseY);
          if(dist < 200*DPR){
            var alpha = 1 - (dist / (200*DPR));
            ctx.strokeStyle = 'rgba(255,0,110,'+(alpha*0.3)+')';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
        }
      }
      
      if(theme === 'mystery'){
        // Mystery: Spiralne cząstki przyciągane do kursora + mroczne macki
        ctx.globalCompositeOperation = 'lighter';
        
        // Świecący okrąg wokół kursora
        var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 100*DPR);
        glow.addColorStop(0, 'rgba(0,208,132,0.2)');
        glow.addColorStop(0.5, 'rgba(157,78,221,0.15)');
        glow.addColorStop(1, 'rgba(0,208,132,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 100*DPR, 0, Math.PI*2);
        ctx.fill();

        // Macki w stylu Cthulhu (długie, poskręcane, mroczne)
        var tentacles = 10;
        var now = Date.now() * 0.0016;
        for(var ti=0; ti<tentacles; ti++){
          var baseAngle = (ti / tentacles) * Math.PI * 2 + tentacleSeeds[ti % tentacleSeeds.length];
          var len = (320 + 180 * Math.sin(now*0.7 + ti*0.8)) * DPR;
          var segs = 7;
          ctx.strokeStyle = 'rgba(6,12,10,0.8)';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          var prevX = mouseX;
          var prevY = mouseY;
          ctx.moveTo(prevX, prevY);
          for(var s=1; s<=segs; s++){
            var progress = s / segs;
            var taper = 1 - progress*0.35;
            ctx.lineWidth = (6.5 * taper) * DPR;
            var wave = Math.sin(now * 3.4 + s*2.1 + tentacleSeeds[ti % tentacleSeeds.length]) * (44 + 28*s) * DPR;
            var wave2 = Math.cos(now * 1.6 + s*1.1 + ti*0.7) * (22 + 12*s) * DPR;
            var angle = baseAngle + wave * 0.0043;
            var px = mouseX + Math.cos(angle) * len * progress + wave2 * 0.55;
            var py = mouseY + Math.sin(angle) * len * progress + wave * 0.22;
            ctx.lineTo(px, py);
            prevX = px; prevY = py;
          }
          ctx.stroke();
          // Jasny rdzeń macki (grubszy, ale węższy niż obrys)
          ctx.strokeStyle = 'rgba(0,208,132,0.42)';
          ctx.lineWidth = 2.4 * DPR;
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          for(var s2=1; s2<=segs; s2++){
            var progress2 = s2 / segs;
            var waveA = Math.sin(now * 2.6 + s2*1.4 + ti) * (22 + 12*s2) * DPR;
            var waveB = Math.cos(now * 3.1 + s2*1.8 + ti*0.6) * (18 + 10*s2) * DPR;
            var angleA = baseAngle + waveA * 0.0035;
            var px2 = mouseX + Math.cos(angleA) * len * progress2 + waveB * 0.25;
            var py2 = mouseY + Math.sin(angleA) * len * progress2 + waveA * 0.18;
            ctx.lineTo(px2, py2);
          }
          ctx.stroke();
        }
        
        // Przyciąganie cząstek do kursora ze spiralnym ruchem
        particles.forEach(function(p){
          var dx = mouseX - p.x;
          var dy = mouseY - p.y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 200*DPR && dist > 20*DPR){
            var force = (200*DPR - dist) / (200*DPR) * 0.15;
            // Dodaj spiralny ruch
            var angle = Math.atan2(dy, dx);
            var perpAngle = angle + Math.PI/2;
            p.vx += Math.cos(angle) * force + Math.cos(perpAngle) * force * 0.5;
            p.vy += Math.sin(angle) * force + Math.sin(perpAngle) * force * 0.5;
          }
        });
      }
      
      ctx.globalCompositeOperation = 'source-over';
    }

    function step(){
      if(!window.particlesEnabled){
        // when disabled, reduce CPU by drawing rarely
        setTimeout(function(){ requestAnimationFrame(step); }, 800);
        return;
      }
      ctx.clearRect(0,0,w,h);
      
      // Draw mouse effects first
      drawMouseEffects();
      
      // subtle gradient overlay
      var grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0,'rgba(0,30,60,0.05)');
      grad.addColorStop(1,'rgba(0,6,20,0.12)');
      ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);

      ctx.globalCompositeOperation = 'lighter';
      for(var i=0;i<particles.length;i++){
        var p = particles[i];
        p.x += p.vx * DPR * 0.6;
        p.y += p.vy * DPR * 0.6;
        p.life += 0.003;
        if(p.x<0||p.x>w||p.y<0||p.y>h||p.life>1){
          particles[i] = {x:Math.random()*w,y:Math.random()*h,vx:rand(-0.25,0.25),vy:rand(-0.1,0.1),r:rand(0.7,2.6),life:0};
          p = particles[i];
        }
        var alpha = 0.18 + 0.6*(1-p.life);
        ctx.beginPath();
        var glow = ctx.createRadialGradient(p.x,p.y,p.r*0.2,p.x,p.y,p.r*10);
        glow.addColorStop(0, 'rgba(55,182,255,'+(alpha)+')');
        glow.addColorStop(1, 'rgba(55,182,255,0)');
        ctx.fillStyle = glow;
        ctx.arc(p.x, p.y, p.r*8, 0, Math.PI*2);
        ctx.fill();
      }

      // connecting lines for nearby particles
      ctx.lineWidth = 0.6 * DPR;
      for(var i=0;i<particles.length;i++){
        for(var j=i+1;j<particles.length;j++){
          var a = particles[i], b = particles[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var d2 = dx*dx+dy*dy;
          if(d2 < (120*DPR)*(120*DPR)){
            var alpha = 0.0007*(120*DPR - Math.sqrt(d2));
            ctx.strokeStyle = 'rgba(0,255,209,'+Math.min(0.26,alpha)+')';
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(step);
    }

    window.addEventListener('resize', function(){ clearTimeout(window.__resizeTimer); window.__resizeTimer = setTimeout(resize,120); });
    resize();
    step();
  })();

  // reduce-FX toggle
  var fxToggle = document.getElementById('fx-toggle');
  function setReduced(val){
    document.body.setAttribute('data-reduced', val ? 'true' : 'false');
    localStorage.setItem('reducedFX', val ? '1' : '0');
    if(fxToggle) fxToggle.setAttribute('aria-pressed', String(!!val));
    window.particlesEnabled = !val;
    var canvas = document.getElementById('bg-canvas');
    if(canvas) canvas.style.opacity = val ? '0' : '1';
  }
  var reducedPref = localStorage.getItem('reducedFX') === '1';
  setReduced(reducedPref);
  if(fxToggle){
    fxToggle.addEventListener('click', function(){ setReduced(!(localStorage.getItem('reducedFX') === '1')); showToast('Reduce FX: ' + (localStorage.getItem('reducedFX') === '1' ? 'ON' : 'OFF')); });
  }
  // theme switcher (replaces old language switch behavior)
  function setTheme(theme){
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('preferredTheme', theme);
    document.querySelectorAll('.theme-switch a').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-theme')===theme);
    });
    showToast('Theme: ' + theme);
  }

  var themePref = localStorage.getItem('preferredTheme') || 'post-apo';
  // Migrate old 'cthulhu' preference to 'mystery'
  if(themePref === 'cthulhu') themePref = 'mystery';
  setTheme(themePref);

  document.querySelectorAll('.theme-switch a[data-theme]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var theme = this.getAttribute('data-theme');
      setTheme(theme);
    });
  });

  // smooth scroll for in-page section links (single document)
  document.querySelectorAll('.top-nav a, a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = this.getAttribute('href')||'';
      if(!href.startsWith('#')) return;
      e.preventDefault();
      var name = href.slice(1);
      var target = document.querySelector('[data-section="'+name+'"]');
      if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  function showToast(msg){
    var t = document.querySelector('.toast');
    if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display='block';
    setTimeout(()=> t.style.display='none',3000);
  }

  document.querySelectorAll('form.radio').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = (form.querySelector('[name="name"]')||{value:''}).value;
      var msg = (form.querySelector('[name="message"]')||{value:''}).value;
      var pr = (form.querySelector('[name="priority"]')||{value:'Normal'}).value;
      var mail = 'mailto:your@email.example'
        + '?subject=' + encodeURIComponent('SOS from ' + (name||'anonymous') + ' ['+pr+']')
        + '&body=' + encodeURIComponent(msg + '\n\nOperator: ' + name + '\nPriority: ' + pr);
      showToast('Opening mail client...');
      window.location.href = mail;
    });
  });

  // Initialize action buttons for wanted list items (Mam / Szukam / Wymienię)
  function initWantedActions(){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem('wantedStatus')||'{}'); }catch(e){ stored = {}; }
    var items = document.querySelectorAll('.wanted li');
    items.forEach(function(li, idx){
      var id = 'wanted-'+idx;
      li.dataset.wantedId = id;
      var current = stored[id] || '';
      if(current) li.setAttribute('data-status', current);
      // avoid recreating actions if they already exist
      var existingActions = li.querySelector('.item-actions');
      var actions = existingActions || document.createElement('div');
      if(!existingActions){
        actions.className = 'item-actions';
        ['have','want','trade'].forEach(function(s){
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'action-btn';
          btn.dataset.status = s;
          btn.textContent = (s==='have')? 'Mam' : (s==='want')? 'Szukam' : 'Wymienię';
          btn.addEventListener('click', function(){
            var storedLocal = {};
            try{ storedLocal = JSON.parse(localStorage.getItem('wantedStatus')||'{}'); }catch(e){ storedLocal = {}; }
            if(li.getAttribute('data-status')===s){
              li.removeAttribute('data-status');
              delete storedLocal[id];
              actions.querySelectorAll('.action-btn').forEach(function(b){ b.classList.remove('active'); });
              showToast('Status usunięty');
            } else {
              li.setAttribute('data-status', s);
              storedLocal[id] = s;
              actions.querySelectorAll('.action-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.status===s); });
              showToast('Status: ' + ((s==='have')? 'Mam' : (s==='want')? 'Szukam' : 'Wymienię'));
            }
            localStorage.setItem('wantedStatus', JSON.stringify(storedLocal));
          });
          actions.appendChild(btn);
        });
        li.appendChild(actions);
      } else {
        // ensure buttons reflect current status
        actions.querySelectorAll('.action-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.status===current); });
      }
    });
  }
  initWantedActions();

  // Apply a stored map of statuses to DOM (used after import)
  function applyWantedStatusMap(stored){
    var items = document.querySelectorAll('.wanted li');
    items.forEach(function(li, idx){
      var id = li.dataset.wantedId || ('wanted-'+idx);
      var s = stored[id] || '';
      if(s) li.setAttribute('data-status', s); else li.removeAttribute('data-status');
      var actions = li.querySelector('.item-actions');
      if(actions){
        actions.querySelectorAll('.action-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.status===s); });
      }
    });
    localStorage.setItem('wantedStatus', JSON.stringify(stored));
  }

  // Filtering controls for wanted list
  document.querySelectorAll('.filter-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      var items = document.querySelectorAll('.wanted li');
      items.forEach(function(li){
        if(f==='all'){ li.style.display = ''; return; }
        var s = li.getAttribute('data-status') || '';
        li.style.display = (s===f) ? '' : 'none';
      });
    });
  });

  // Export / Import JSON for wanted list
  var exportBtn = document.getElementById('export-wanted');
  var importBtn = document.getElementById('import-wanted');
  var importInput = document.getElementById('import-wanted-file');
  if(exportBtn){
    exportBtn.addEventListener('click', function(){
      var items = document.querySelectorAll('.wanted li');
      var payload = { exportedAt: new Date().toISOString(), items: [] };
      items.forEach(function(li){
        var id = li.dataset.wantedId || '';
        var text = (li.firstChild && li.firstChild.textContent) ? li.firstChild.textContent.trim() : li.textContent.trim();
        var status = li.getAttribute('data-status')||'';
        payload.items.push({id:id, text:text, status:status});
      });
      var blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'wanted-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      showToast('Eksportowano JSON');
    });
  }
  if(importBtn && importInput){
    importBtn.addEventListener('click', function(e){ e.preventDefault(); importInput.click(); });
    importInput.addEventListener('change', function(ev){
      var f = ev.target.files && ev.target.files[0]; if(!f) return; var r = new FileReader();
      r.onload = function(){
        try{
          var obj = JSON.parse(r.result);
          var stored = JSON.parse(localStorage.getItem('wantedStatus')||'{}');

          // helper: try to match a text to a list item (exact then contains)
          function findByText(text){
            if(!text) return null;
            var normalized = text.trim().toLowerCase();
            var list = Array.from(document.querySelectorAll('.wanted li'));
            var exact = list.find(function(li){
              var t = (li.firstChild && li.firstChild.textContent) ? li.firstChild.textContent.trim().toLowerCase() : li.textContent.trim().toLowerCase();
              return t === normalized;
            });
            if(exact) return exact;
            // try contains
            return list.find(function(li){
              var t = (li.firstChild && li.firstChild.textContent) ? li.firstChild.textContent.trim().toLowerCase() : li.textContent.trim().toLowerCase();
              return t.indexOf(normalized) !== -1 || normalized.indexOf(t) !== -1;
            }) || null;
          }

          // Determine incoming format and normalize to array of items
          var incoming = [];
          if(Array.isArray(obj)) incoming = obj;
          else if(obj && Array.isArray(obj.items)) incoming = obj.items;
          else if(obj && Array.isArray(obj.list)) incoming = obj.list;

          if(incoming.length > 0){
            // Detect if incoming items are in PDF-inventory format or already {text,status}
            incoming.forEach(function(it){
              // if it has 'text' and optional 'status', use as-is
              if(it && (it.text || it.id) && ('status' in it)){
                var text = it.text || it.id || '';
                var found = findByText(text);
                if(found){ var id = found.dataset.wantedId; if(it.status) stored[id]=it.status; else delete stored[id]; }
                return;
              }

              // Otherwise try to interpret fields: accept keys in English or Polish
              var keys = Object.keys(it||{}).map(function(k){ return k.toLowerCase(); });
              var hasSystem = keys.includes('system') || keys.includes('nazwa systemu') || keys.includes('nazwa_systemu');
              var hasBook = keys.includes('book') || keys.includes('title') || keys.includes('nazwa') || keys.includes('nazwa podręcznika') || keys.includes('nazwa_podręcznika');
              var hasAcq = keys.includes('acquired') || keys.includes('acquisition') || keys.includes('data uzyskania') || keys.includes('data_uzyskania') || keys.includes('acquired_date') || keys.includes('date_acquired');
              // build text to match
              var system = it.system || it['nazwa systemu'] || it['nazwa_systemu'] || '';
              var book = it.book || it.title || it.nazwa || it['nazwa podręcznika'] || it['nazwa_podręcznika'] || it['podręcznik'] || it['podrecznik'] || '';
              var combined = (system? (system + ' - ') : '') + (book || '');
              // find matching li
              var found = findByText(combined) || findByText(book) || findByText(it.name || it.book || it.title || it.nazwa);
              if(found){
                var id = found.dataset.wantedId;
                // determine acquisition presence
                var acq = it.acquired || it.acquisition || it['data uzyskania'] || it['data_uzyskania'] || it.acquired_date || it['date_acquired'] || '';
                // also accept 'data sprzedazy' etc but we care about acquisition
                var has = (acq && String(acq).trim().length>0);
                if(has) stored[id] = 'have'; else stored[id] = 'want';
              }
            });
            applyWantedStatusMap(stored);
            showToast('Zaimportowano dane');
          } else {
            showToast('Nieprawidłowy plik');
          }
        }catch(e){ showToast('Błąd importu'); }
      };
      r.readAsText(f);
      importInput.value = '';
    });
  }

  /* --- PDF inventory loader, renderer, sorting & filtering --- */
  (function(){
    var pdfData = [];
    var container = document.getElementById('pdf-list-container');
    var sortFieldEl = document.getElementById('pdf-sort-field');
    var sortOrderEl = document.getElementById('pdf-sort-order');
    var searchEl = document.getElementById('pdf-search');
    var refreshBtn = document.getElementById('pdf-refresh');

    function safeGet(v){ return (v===null||v===undefined)?'':String(v); }

    function compareValues(a,b,field){
      var va = safeGet(a[field]).toLowerCase();
      var vb = safeGet(b[field]).toLowerCase();
      // if field looks like a date (date_sale/date_acquired), try date compare
      if(field.indexOf('date')===0 || field.indexOf('date')!==-1){
        var da = Date.parse(safeGet(a[field])) || 0;
        var db = Date.parse(safeGet(b[field])) || 0;
        return da - db;
      }
      return va.localeCompare(vb, 'pl', {sensitivity:'base'});
    }

    function renderTable(items){
      if(!container) return;
      if(!items || items.length===0){ container.innerHTML = '<div class="pdf-empty">Brak pozycji do wyświetlenia.</div>'; return; }
      var html = ['<table><thead><tr>',
        '<th class="sortable" data-field="language">Język</th>',
        '<th class="sortable" data-field="publisher">Wydawnictwo</th>',
        '<th class="sortable" data-field="system">System</th>',
        '<th class="sortable" data-field="title">Tytuł</th>',
        '<th class="sortable" data-field="date_sale">Data sprzedaży</th>',
        '<th class="sortable" data-field="date_acquired">Data uzyskania</th>',
        '</tr></thead><tbody>'];
      items.forEach(function(it){
        var lang = safeGet(it.language);
        var pub = safeGet(it.publisher);
        var sys = safeGet(it.system);
        var title = safeGet(it.title);
        var img = safeGet(it.image);
        var link = safeGet(it.link);
        var ds = safeGet(it.date_sale);
        var da = safeGet(it.date_acquired);
        var titleHtml = '';
        if(img){ titleHtml += '<img class="thumb" src="'+img+'" alt="thumb">'; }
        if(link){ titleHtml += '<a href="'+link+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(title)+'</a>'; }
        else { titleHtml += '<span>'+escapeHtml(title)+'</span>'; }
        html.push('<tr>',
          '<td>'+escapeHtml(lang)+'</td>',
          '<td>'+escapeHtml(pub)+'</td>',
          '<td>'+escapeHtml(sys)+'</td>',
          '<td><div class="pdf-meta">'+titleHtml+'</div></td>',
          '<td class="date">'+escapeHtml(ds)+'</td>',
          '<td class="date">'+escapeHtml(da)+'</td>',
          '</tr>');
      });
      html.push('</tbody></table>');
      container.innerHTML = html.join('');

      // hide broken thumbnails
      container.querySelectorAll('img.thumb').forEach(function(img){ img.onerror = function(){ this.style.display='none'; }; });

      // attach click handlers to header cells to enable sorting by column
      try{
        var ths = container.querySelectorAll('th.sortable');
        ths.forEach(function(th){
          var f = th.getAttribute('data-field');
          // mark active sorted column
          if(sortFieldEl && sortFieldEl.value === f){
            th.classList.add((sortOrderEl && sortOrderEl.value==='asc')? 'sorted-asc':'sorted-desc');
          }
          th.addEventListener('click', function(){
            if(!sortFieldEl || !sortOrderEl) return;
            var field = th.getAttribute('data-field');
            if(sortFieldEl.value === field){
              // toggle order
              sortOrderEl.value = (sortOrderEl.value === 'asc') ? 'desc' : 'asc';
            } else {
              sortFieldEl.value = field;
              sortOrderEl.value = 'asc';
            }
            // update header classes
            container.querySelectorAll('th.sortable').forEach(function(h){ h.classList.remove('sorted-asc','sorted-desc'); });
            th.classList.add(sortOrderEl.value==='asc' ? 'sorted-asc' : 'sorted-desc');
            applyFiltersAndSort();
          });
        });
      }catch(e){ /* ignore attach errors */ }
    }

    /* --- Filter UI build & handlers --- */
    var filterLangEl = document.getElementById('filter-languages');
    var filterPubEl = document.getElementById('filter-publishers');
    var filterSysEl = document.getElementById('filter-systems');
    var filterPossessionEl = document.getElementById('filter-possession');

    var selectedLanguages = new Set();
    var selectedPublishers = new Set();
    var selectedSystems = new Set();
    var possessionFilter = 'all'; // all | have | want

    function buildFilters(data){
      if(!Array.isArray(data)) return;
      var langs = new Set();
      var pubs = new Set();
      var syss = new Set();
      data.forEach(function(it){ langs.add(safeGet(it.language)); pubs.add(safeGet(it.publisher)); syss.add(safeGet(it.system)); });

      function renderSet(container, items, prefix, onChange){
        if(!container) return;
        var arr = Array.from(items).filter(Boolean).sort(function(a,b){ return a.localeCompare(b,'pl',{sensitivity:'base'}); });
        var selectAllId = prefix+'-selectAll';
        var html = '<label class="chk select-all"><input type="checkbox" id="'+selectAllId+'" data-selectall="true"> Wszystkie</label>';
        html += arr.map(function(v,i){
          var id = prefix+'-'+i;
          return '<label class="chk"><input type="checkbox" id="'+id+'" data-value="'+escapeHtml(v)+'"> '+escapeHtml(v)+'</label>';
        }).join('');
        container.innerHTML = html;
        var selectAllCb = document.getElementById(selectAllId);
        var checkboxes = container.querySelectorAll('input[type="checkbox"]:not([data-selectall])');
        selectAllCb.addEventListener('change', function(){
          checkboxes.forEach(function(cb){ cb.checked = selectAllCb.checked; });
          onChange();
        });
        checkboxes.forEach(function(cb){
          cb.addEventListener('change', function(){
            var allChecked = Array.from(checkboxes).every(function(c){ return c.checked; });
            selectAllCb.checked = allChecked;
            onChange();
          });
        });
      }

      // Build standard filters
      renderSet(filterLangEl, langs, 'lang', function(){
        selectedLanguages = new Set(Array.from(filterLangEl.querySelectorAll('input:checked')).map(function(i){ return i.getAttribute('data-value'); }));
        applyFiltersAndSort();
      });
      renderSet(filterPubEl, pubs, 'pub', function(){
        selectedPublishers = new Set(Array.from(filterPubEl.querySelectorAll('input:checked')).map(function(i){ return i.getAttribute('data-value'); }));
        applyFiltersAndSort();
      });
      renderSet(filterSysEl, syss, 'sys', function(){
        selectedSystems = new Set(Array.from(filterSysEl.querySelectorAll('input:checked')).map(function(i){ return i.getAttribute('data-value'); }));
        applyFiltersAndSort();
      });

      // Build possession filter as checkboxes
      if(filterPossessionEl){
        var possessionOptions = [
          {value: 'all', label: 'Wszystkie'},
          {value: 'have', label: 'Posiadane'},
          {value: 'want', label: 'Poszukiwane'}
        ];
        var possessionHtml = possessionOptions.map(function(opt, i){
          var id = 'poss-'+i;
          var checked = opt.value === 'all' ? ' checked' : '';
          return '<label class="chk"><input type="checkbox" id="'+id+'" data-value="'+opt.value+'"'+checked+'> '+opt.label+'</label>';
        }).join('');
        filterPossessionEl.innerHTML = possessionHtml;
        filterPossessionEl.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox){
          checkbox.addEventListener('change', function(){
            var allCheckbox = document.getElementById('poss-0');
            var haveCheckbox = document.getElementById('poss-1');
            var wantCheckbox = document.getElementById('poss-2');
            
            // If 'all' is checked, uncheck others
            if(this.id === 'poss-0' && this.checked){
              haveCheckbox.checked = false;
              wantCheckbox.checked = false;
              possessionFilter = 'all';
            } else if(this.id !== 'poss-0' && this.checked){
              allCheckbox.checked = false;
              if(haveCheckbox.checked && wantCheckbox.checked){
                allCheckbox.checked = true;
                haveCheckbox.checked = false;
                wantCheckbox.checked = false;
                possessionFilter = 'all';
              } else if(haveCheckbox.checked){
                possessionFilter = 'have';
              } else if(wantCheckbox.checked){
                possessionFilter = 'want';
              }
            } else {
              // If all unchecked, default to 'all'
              if(!allCheckbox.checked && !haveCheckbox.checked && !wantCheckbox.checked){
                allCheckbox.checked = true;
                possessionFilter = 'all';
              }
            }
            applyFiltersAndSort();
          });
        });
      }
    }

    function escapeHtml(s){ return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

    function applyFiltersAndSort(){
      var q = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : '';
      var field = sortFieldEl ? sortFieldEl.value : 'title';
      var order = sortOrderEl ? sortOrderEl.value : 'asc';
      // persist preference
      try{ localStorage.setItem('pdfSort', JSON.stringify({field: field, order: order})); }catch(e){}
      var filtered = pdfData.filter(function(it){
        // search text
        if(q){
          var aggregated = [safeGet(it.publisher), safeGet(it.system), safeGet(it.title)].join(' ').toLowerCase();
          if(aggregated.indexOf(q) === -1) return false;
        }
        // language filter
        if(selectedLanguages.size > 0){ if(!selectedLanguages.has(safeGet(it.language))) return false; }
        // publisher filter
        if(selectedPublishers.size > 0){ if(!selectedPublishers.has(safeGet(it.publisher))) return false; }
        // system filter
        if(selectedSystems.size > 0){ if(!selectedSystems.has(safeGet(it.system))) return false; }
        // possession filter: treat 'have' when date_acquired is non-empty
        if(possessionFilter === 'have'){ if(!String(safeGet(it.date_acquired)).trim()) return false; }
        if(possessionFilter === 'want'){ if(String(safeGet(it.date_acquired)).trim()) return false; }
        return true;
      });
      filtered.sort(function(a,b){
        var cmp = compareValues(a,b,field);
        return (order==='asc') ? cmp : -cmp;
      });
      renderTable(filtered);
    }

    function loadJson(){
      if(!container) return;
      container.innerHTML = '<p class="summary">Ładowanie listy...</p>';
      fetch('rpg-pdfs.json').then(function(resp){ if(!resp.ok) throw new Error('HTTP '+resp.status); return resp.json(); }).then(function(data){
        pdfData = Array.isArray(data) ? data : (data.items || []);
        // build dynamic filters from loaded data
        try{ buildFilters(pdfData); }catch(e){}
        // restore saved sort preference if present
        try{
          var saved = JSON.parse(localStorage.getItem('pdfSort')||'{}');
          if(saved && saved.field && sortFieldEl) sortFieldEl.value = saved.field;
          if(saved && saved.order && sortOrderEl) sortOrderEl.value = saved.order;
        }catch(e){}
        applyFiltersAndSort();
      }).catch(function(err){ container.innerHTML = '<div class="pdf-empty">Nie udało się załadować rpg-pdfs.json ('+ (err.message||'') +')</div>'; });
    }

    if(sortFieldEl) sortFieldEl.addEventListener('change', applyFiltersAndSort);
    if(sortOrderEl) sortOrderEl.addEventListener('change', applyFiltersAndSort);
    if(searchEl) searchEl.addEventListener('input', function(){ setTimeout(applyFiltersAndSort, 120); });
    if(refreshBtn) refreshBtn.addEventListener('click', function(){ loadJson(); showToast('Odświeżono listę PDF'); });

    // initial load
    loadJson();
  })();
});
