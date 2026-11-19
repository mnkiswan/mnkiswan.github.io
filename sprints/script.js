const { formEndpoint, pixelId } = window.sprintConfig;
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById("application");
if (form && /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(formEndpoint)) {
  const button = form.querySelector("button[type=submit]");
  const status = document.getElementById("form-status");
  form.hidden = false;
  document.getElementById("fallback").hidden = true;
  document.querySelector(".form-note").textContent = "Formspree processes your application for the studio.";
  button.disabled = false;
  status.textContent = "";
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = "Sending your application…";
    try {
      const response = await fetch(formEndpoint, {
        method: "POST", body: new FormData(form), headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
    } catch {
      status.textContent = "Delivery could not be confirmed. Your answers are still here. Please try again.";
      button.disabled = false;
      return;
    }
    try { sessionStorage.setItem("sprint-received", "1"); } catch {}
    location.assign("thanks.html");
  });
}

const settings = document.getElementById("settings");
const dialog = document.getElementById("consent");
function measure() {
  if (!window.fbq) {
    const queue = function (...args) {
      if (queue.callMethod) queue.callMethod.apply(queue, args);
      else queue.queue.push(args);
    };
    queue.queue = []; queue.version = "2.0"; queue.loaded = true;
    window.fbq = window._fbq = queue;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
    queue("init", pixelId);
    queue("track", "PageView");
  }
  if (location.pathname.endsWith("/thanks.html")) {
    try {
      if (sessionStorage.getItem("sprint-received") === "1") {
        sessionStorage.removeItem("sprint-received");
        window.fbq("track", "Lead");
      }
    } catch {}
  }
}
if (/^\d+$/.test(pixelId)) {
  settings.hidden = false;
  let choice;
  try { choice = localStorage.getItem("sprint-tracking"); } catch {}
  settings.onclick = () => dialog.showModal();
  function choose(value) {
    try { localStorage.setItem("sprint-tracking", value); } catch {}
    dialog.close();
    if (value === "allow") {
      if (window.fbq) window.fbq("consent", "grant");
      measure();
    } else if (window.fbq) window.fbq("consent", "revoke");
  }
  document.getElementById("allow").onclick = () => choose("allow");
  document.getElementById("deny").onclick = () => choose("deny");
  if (choice === "allow") measure();
  else if (!choice) dialog.showModal();
}
