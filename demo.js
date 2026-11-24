/* Demo wiring for forma-4d-core: sliders and two material buttons. */
(function () {
  var st = H4D.make(document.getElementById("cv"), { mat: 1, host: document.body, scale: .8, cap: 1.5 });
  if (!st) { document.querySelector(".ui h1").textContent = "WebGL2 is not available on this device."; return; }
  function bind(id, key, k) { var el = document.getElementById(id); var f = function () { st.set(key, +el.value / k); }; el.addEventListener("input", f); f(); }
  bind("sl", "slice", 100); bind("sp", "spin", 100); bind("ds", "disp", 1000); bind("th", "thick", 1000);
  document.querySelectorAll("[data-mat]").forEach(function (b) {
    b.addEventListener("click", function () {
      st.set("mat", +b.getAttribute("data-mat"));
      document.querySelectorAll("[data-mat]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
  });
})();
