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
            ctx.strokeStyle = 'rgba(55,182,255,'+Math.min(0.26,alpha)+')';
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

  // language switcher
  function setLang(lang){
    document.body.setAttribute('data-lang',lang);
    localStorage.setItem('preferredLang',lang);
    document.querySelectorAll('.lang-switch a').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-lang')===lang);
    });
    document.documentElement.lang = (lang==='pl') ? 'pl' : 'en';
  }

  var pref = localStorage.getItem('preferredLang') || 'en';
  setLang(pref);

  document.querySelectorAll('.lang-switch a[data-lang]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var lang = this.getAttribute('data-lang');
      setLang(lang);
      showToast('Language: ' + lang.toUpperCase());
    });
  });

  // smooth scroll for in-page section links (works with current language)
  document.querySelectorAll('.top-nav a, a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = this.getAttribute('href')||'';
      if(!href.startsWith('#')) return; // ignore external
      e.preventDefault();
      var name = href.slice(1);
      var lang = document.body.getAttribute('data-lang') || 'en';
      var container = document.querySelector('.lang-' + lang + ' .content');
      var target = document.querySelector('.lang-' + lang + ' [data-section="'+name+'"]');
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
});
