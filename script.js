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

    function step(){
      if(!window.particlesEnabled){
        // when disabled, reduce CPU by drawing rarely
        setTimeout(function(){ requestAnimationFrame(step); }, 800);
        return;
      }
      ctx.clearRect(0,0,w,h);
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
        '<th>Wydawnictwo</th>','<th>System</th>','<th>Tytuł</th>','<th>Data sprzedaży</th>','<th>Data uzyskania</th>',
        '</tr></thead><tbody>'];
      items.forEach(function(it){
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
          '<td>'+escapeHtml(pub)+'</td>',
          '<td>'+escapeHtml(sys)+'</td>',
          '<td><div class="pdf-meta">'+titleHtml+'</div></td>',
          '<td class="date">'+escapeHtml(ds)+'</td>',
          '<td class="date">'+escapeHtml(da)+'</td>',
          '</tr>');
      });
      html.push('</tbody></table>');
      container.innerHTML = html.join('');
    }

    function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

    function applyFiltersAndSort(){
      var q = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : '';
      var field = sortFieldEl ? sortFieldEl.value : 'title';
      var order = sortOrderEl ? sortOrderEl.value : 'asc';
      var filtered = pdfData.filter(function(it){
        if(!q) return true;
        var aggregated = [safeGet(it.publisher), safeGet(it.system), safeGet(it.title)].join(' ').toLowerCase();
        return aggregated.indexOf(q) !== -1;
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
