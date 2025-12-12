(() => {
  if (!window.fetch) return console.warn("Fetch API not supported.");

  const attachHandler = (form) => {
    if (form.dataset.sleekcmsAttached) return;
    form.dataset.sleekcmsAttached = "true";

    const messageBox = document.createElement("div");
    messageBox.style.marginTop = "8px";
    messageBox.style.fontFamily = "sans-serif";
    form.appendChild(messageBox);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      messageBox.textContent = "Submitting...";
      messageBox.style.color = "#555";

      const formData = new FormData(form);
      let action = form.getAttribute("action") || form.getAttribute("data-action");

      if (!action) {
        const sleekcmsAttr = form.getAttribute("data-sleekcms");
        if (sleekcmsAttr && /^[a-z0-9]+-[a-z0-9]+$/.test(sleekcmsAttr)) {
          action = `https://form.sleekcms.com/${sleekcmsAttr}`;
        } else {
          messageBox.textContent = "Error: No action URL specified. Please add an 'action' or 'data-action' attribute to the form.";
          messageBox.style.color = "red";
          return;
        }
      }
      let method = form.method || "POST";
      if (action.match(/sleekcms\.com/)) method = "POST";
      else method = method.toUpperCase();

      try {
        const res = await fetch(action, {
          method,
          body: formData,
        });

        const contentType = res.headers.get("content-type") || "";
        let resJson = {};

        if (contentType.includes("application/json")) {
          resJson = await res.json();
        } else {
          resJson.message = (await res.text())?.trim() || "";
        }

        messageBox.textContent =
          res.ok
            ? resJson.message || "Form submitted successfully!"
            : resJson.message || "Something went wrong.";
        messageBox.style.color = res.ok ? "green" : "red";

        if (res.ok) form.reset();
      } catch {
        messageBox.textContent = "Network error. Please try again.";
        messageBox.style.color = "red";
      }
    });
  };

  setTimeout(() => {
    document.querySelectorAll('form[data-sleekcms]').forEach(attachHandler);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.matches('form[data-sleekcms]')
          ) {
            attachHandler(node);
          } else if (node.querySelectorAll) {
            node
              .querySelectorAll('form[data-sleekcms]')
              .forEach(attachHandler);
          }[]
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }, 2000);
})();
