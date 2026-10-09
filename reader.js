/* 浊堤 · 阅读 —— 共用脚本 */
(function () {
  "use strict";

  var CH = [["一", "雨账"], ["二", "堤脚"], ["三", "旧册"], ["四", "夜汛"], ["五", "水过"], ["六", "漏名"], ["七", "土地庙"], ["八", "一碗粥"], ["九", "旧同年"], ["十", "撤夫令"], ["十一", "纸上人"], ["十二", "旧笔"], ["十三", "回头"], ["十四", "赈粮"], ["十五", "封柜"], ["十六", "钥匙"], ["十七", "寄出"], ["十八", "等"], ["十九", "批回"], ["二十", "照例"]];
  var root = document.documentElement;
  var page = document.querySelector(".page");
  var chNo = page ? parseInt(page.getAttribute("data-ch") || "0", 10) : 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 本地记忆（可能不可用） ---------- */
  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- 设置 ---------- */
  var SIZES = [16, 17, 18, 19, 20, 22, 24];
  function defaultSize() { return window.matchMedia("(max-width: 600px)").matches ? 18 : 19; }
  var fs = parseInt(get("zd.fs") || "0", 10) || defaultSize();
  var READS = ["lv", "yang", "ye"];
  var read = get("zd.tone");
  if (READS.indexOf(read) < 0) read = "lv";
  var rainOn = get("zd.rain") !== "off";

  function applyRead() {
    if (read === "lv") root.removeAttribute("data-read"); else root.setAttribute("data-read", read);
    document.querySelectorAll(".sw").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-read") === read ? "true" : "false");
    });
    Rain.recolor();
  }
  function applySize() {
    root.style.setProperty("--fs", fs + "px");
    var out = document.querySelector(".stepper output");
    if (out) out.textContent = fs + " 号";
    var dn = document.querySelector('[data-step="-1"]'), up = document.querySelector('[data-step="1"]');
    if (dn) dn.disabled = fs <= SIZES[0];
    if (up) up.disabled = fs >= SIZES[SIZES.length - 1];
  }
  function applyRain() {
    if (rainOn) root.removeAttribute("data-rain"); else root.setAttribute("data-rain", "off");
    var sw = document.getElementById("rainSw");
    if (sw) sw.setAttribute("aria-checked", rainOn ? "true" : "false");
    Rain.toggle(rainOn);
  }

  var aa = document.getElementById("aa");
  var panel = document.getElementById("panel");
  function openPanel(open) {
    if (!panel || !aa) return;
    panel.hidden = !open;
    aa.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (aa && panel) {
    aa.addEventListener("click", function (e) { e.stopPropagation(); openPanel(panel.hidden); });
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { if (!panel.hidden) openPanel(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { openPanel(false); aa.focus(); } });
    panel.querySelectorAll(".sw").forEach(function (b) {
      b.addEventListener("click", function () { read = b.getAttribute("data-read"); set("zd.tone", read); applyRead(); });
    });
    panel.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = SIZES.indexOf(fs); if (i < 0) i = 3;
        i = Math.max(0, Math.min(SIZES.length - 1, i + parseInt(b.getAttribute("data-step"), 10)));
        var ratio = progress();
        fs = SIZES[i]; set("zd.fs", String(fs)); applySize();
        if (chNo) restore(ratio);
      });
    });
    var rs = document.getElementById("rainSw");
    if (rs) rs.addEventListener("click", function () { rainOn = !rainOn; set("zd.rain", rainOn ? "on" : "off"); applyRain(); });
  }

  /* ---------- 雨 ---------- */
  var Rain = (function () {
    var list = [];
    var color = "58,66,74", alpha = 0.3;
    function readColor() {
      var cs = getComputedStyle(root);
      var c = (cs.getPropertyValue("--rain") || "58 66 74").trim().split(/\s+/).join(",");
      var a = parseFloat(cs.getPropertyValue("--rain-a")) || 0.3;
      color = c; alpha = a;
    }
    function make(cv) {
      var ctx = cv.getContext("2d");
      var w = 0, h = 0, drops = [], raf = 0, seen = true, density = parseFloat(cv.getAttribute("data-density") || "5200");
      function drop(init) {
        var z = Math.random();
        return { x: Math.random() * (w + 120) - 60, y: init ? Math.random() * h : -30 - Math.random() * h * 0.4, z: z, len: 9 + z * 20, sp: 5 + z * 9 };
      }
      function size() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var r = cv.getBoundingClientRect();
        w = Math.max(1, r.width); h = Math.max(1, r.height);
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round((w * h) / density);
        drops = []; for (var i = 0; i < n; i++) drops.push(drop(true));
        if (reduce || !raf) paint(false);
      }
      function paint(step) {
        ctx.clearRect(0, 0, w, h);
        ctx.lineCap = "round";
        for (var i = 0; i < drops.length; i++) {
          var d = drops[i];
          if (step) {
            d.y += d.sp; d.x -= d.sp * 0.14;
            if (d.y - d.len > h || d.x < -40) { drops[i] = d = drop(false); }
          }
          ctx.strokeStyle = "rgba(" + color + "," + (alpha * (0.3 + 0.7 * d.z)).toFixed(3) + ")";
          ctx.lineWidth = 0.6 + d.z * 0.8;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * 0.14, d.y - d.len);
          ctx.stroke();
        }
      }
      function loop() { paint(true); raf = window.requestAnimationFrame(loop); }
      function start() { if (raf || reduce || !rainOn || !seen || document.hidden) return; raf = window.requestAnimationFrame(loop); }
      function stop() { if (raf) window.cancelAnimationFrame(raf); raf = 0; }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) start(); else stop(); }).observe(cv);
      }
      var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(size, 150); });
      size();
      return { start: start, stop: stop, repaint: function () { paint(false); } };
    }
    function init() {
      readColor();
      document.querySelectorAll("canvas.rain").forEach(function (cv) { list.push(make(cv)); });
      document.addEventListener("visibilitychange", function () { list.forEach(function (r) { if (document.hidden) r.stop(); else r.start(); }); });
      list.forEach(function (r) { r.start(); });
    }
    return {
      init: init,
      toggle: function (on) { list.forEach(function (r) { if (on) r.start(); else r.stop(); }); },
      recolor: function () { readColor(); list.forEach(function (r) { r.repaint(); }); }
    };
  })();

  /* ---------- 听雨（窗外雨声，点了才响） ---------- */
  var Sound = (function () {
    var ctx = null, master = null, srcs = [], timers = [], on = false;
    function noise(kind, secs) {
      var len = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) {
        var wv = Math.random() * 2 - 1;
        if (kind === "brown") { last = (last + 0.02 * wv) / 1.02; d[i] = last * 3.2; } else d[i] = wv;
      }
      return b;
    }
    function patter() {
      if (!on) return;
      var t = ctx.currentTime, len = Math.floor(ctx.sampleRate * 0.025), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      var s = ctx.createBufferSource(); s.buffer = b;
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800 + Math.random() * 3800; bp.Q.value = 1.2;
      var g = ctx.createGain(); g.gain.value = 0.04 + Math.random() * 0.1;
      var out = g;
      if (ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.6 - 0.8; g.connect(p); out = p; }
      s.connect(bp); bp.connect(g); out.connect(master); s.start(t);
      timers.push(setTimeout(patter, 25 + Math.random() * 140));
      if (timers.length > 50) timers.splice(0, 40);
    }
    function eave() {
      if (!on) return;
      // 檐水，一滴一滴落在阶石上
      var t = ctx.currentTime + 0.02, o = ctx.createOscillator(), g = ctx.createGain();
      var f = 700 + Math.random() * 500;
      o.type = "sine"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
      timers.push(setTimeout(eave, 1100 + Math.random() * 2600));
    }
    function start() {
      if (on) return true;
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
      if (ctx.resume) ctx.resume();
      master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
      var s1 = ctx.createBufferSource(); s1.buffer = noise("white", 3); s1.loop = true;
      var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 450;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2800;
      var g1 = ctx.createGain(); g1.gain.value = 0.11;
      s1.connect(hp); hp.connect(lp); lp.connect(g1); g1.connect(master);
      var s2 = ctx.createBufferSource(); s2.buffer = noise("brown", 4); s2.loop = true;
      var lp2 = ctx.createBiquadFilter(); lp2.type = "lowpass"; lp2.frequency.value = 520;
      var g2 = ctx.createGain(); g2.gain.value = 0.45;
      s2.connect(lp2); lp2.connect(g2); g2.connect(master);
      var lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
      var lg = ctx.createGain(); lg.gain.value = 0.035; lfo.connect(lg); lg.connect(g1.gain);
      s1.start(); s2.start(); lfo.start();
      srcs = [s1, s2, lfo];
      var t = ctx.currentTime;
      master.gain.setValueAtTime(0.0001, t);
      master.gain.exponentialRampToValueAtTime(0.6, t + 2.5);
      on = true; patter(); eave();
      return true;
    }
    function stop() {
      if (!on) return;
      on = false;
      timers.forEach(clearTimeout); timers = [];
      var t = ctx.currentTime, m = master, ss = srcs;
      m.gain.cancelScheduledValues(t); m.gain.setValueAtTime(m.gain.value || 0.0001, t); m.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      setTimeout(function () { ss.forEach(function (s) { try { s.stop(); } catch (e) {} }); try { m.disconnect(); } catch (e) {} }, 1400);
    }
    document.addEventListener("visibilitychange", function () {
      if (!ctx || !on) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    return { start: start, stop: stop, isOn: function () { return on; } };
  })();

  var snd = document.getElementById("snd");
  if (snd) {
    var armed = get("zd.sound") === "on";
    function paintSnd() {
      snd.setAttribute("aria-pressed", Sound.isOn() ? "true" : "false");
      snd.classList.toggle("armed", armed && !Sound.isOn());
    }
    snd.addEventListener("click", function (e) {
      e.stopPropagation();
      if (Sound.isOn() || armed) { Sound.stop(); armed = false; set("zd.sound", "off"); }
      else if (Sound.start()) { set("zd.sound", "on"); }
      paintSnd();
    });
    if (armed) {
      // 上一页开着雨声：在这一页第一次点按时接着响
      var wake = function (e) {
        if (e && e.target && snd.contains(e.target)) return;
        document.removeEventListener("pointerdown", wake, true);
        document.removeEventListener("keydown", wake, true);
        if (armed && Sound.start()) armed = false;
        paintSnd();
      };
      document.addEventListener("pointerdown", wake, true);
      document.addEventListener("keydown", wake, true);
    }
    paintSnd();
  }

  /* ---------- 章节页：进度、续读、翻页 ---------- */
  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  function restore(ratio) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(ratio * max));
  }

  if (chNo) {
    var bar = document.querySelector(".bar");
    var prog = document.querySelector(".bar-prog i");
    var head = document.querySelector(".ch-head");
    set("zd.last", String(chNo));

    if (head && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        bar.classList.toggle("show-title", !es[0].isIntersecting);
      }, { rootMargin: "-" + (bar.offsetHeight + 10) + "px 0px 0px 0px" }).observe(head.querySelector(".ch-title") || head);
    }

    var saveT = 0;
    function onScroll() {
      var p = progress();
      if (prog) prog.style.transform = "scaleX(" + p.toFixed(4) + ")";
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        set("zd.pos." + chNo, p.toFixed(4));
        if (p > 0.96) {
          var done = (get("zd.done") || "").split(",").filter(Boolean);
          if (done.indexOf(String(chNo)) < 0) { done.push(String(chNo)); set("zd.done", done.join(",")); }
        }
      }, 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    if (location.hash === "#resume") {
      var r = parseFloat(get("zd.pos." + chNo) || "0");
      var resumeAt = function () { if (r > 0.01) restore(r); onScroll(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(resumeAt, 30); }); else setTimeout(resumeAt, 200);
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
    onScroll();

    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      var to = null;
      if (e.key === "ArrowLeft") to = page.getAttribute("data-prev");
      if (e.key === "ArrowRight") to = page.getAttribute("data-next");
      if (to) { location.href = to; }
    });
  }

  /* ---------- 书封页：续读与已读 ---------- */
  if (!chNo && page) {
    var last = parseInt(get("zd.last") || "0", 10);
    var go = document.getElementById("go");
    var again = document.getElementById("again");
    if (last >= 1 && last <= CH.length && go) {
      var pos = parseFloat(get("zd.pos." + last) || "0");
      var nextUp = last;
      if (pos > 0.96 && last < CH.length) nextUp = last + 1;
      var c = CH[nextUp - 1];
      go.href = "ch" + pad(nextUp) + ".html" + (nextUp === last ? "#resume" : "");
      go.textContent = "接着读 · 第" + c[0] + "章　" + c[1];
      if (again) again.hidden = false;
    }
    var done = (get("zd.done") || "").split(",");
    document.querySelectorAll(".toc a").forEach(function (a) {
      var n = a.getAttribute("data-n");
      if (done.indexOf(n) >= 0) a.classList.add("done");
      if (String(last) === n) {
        var tag = a.querySelector(".toc-tag");
        if (tag) tag.hidden = false;
      }
    });
  }

  applySize();
  Rain.init();
  applyRead();
  applyRain();
})();
