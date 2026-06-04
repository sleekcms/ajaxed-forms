(() => {
  if (!window.fetch) return console.warn("Fetch API not supported.");

  // Inject the spinner keyframes once for the whole page.
  const STYLE_ID = "sleekcms-forms-styles";
  const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = "@keyframes sleekcms-spin{to{transform:rotate(360deg)}}";
    (document.head || document.documentElement).appendChild(style);
  };

  const attachHandler = (form) => {
    if (form.dataset.sleekcmsAttached) return;
    form.dataset.sleekcmsAttached = "true";

    ensureStyles();

    // The overlay is absolutely positioned, so the form has to be its
    // containing block. Only override a static (default) position.
    const pos = window.getComputedStyle(form).position;
    if (!pos || pos === "static") form.style.position = "relative";

    // --- Overlay that dims the whole form area ---
    const overlay = document.createElement("div");
    overlay.className = "sleekcms-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
      background: "rgba(255, 255, 255, 0.92)",
      borderRadius: "inherit",
      zIndex: "2147483646",
    });

    // The card holds the spinner/message/close. It is centered inside the
    // overlay for normal forms, but re-anchored to the viewport (see
    // positionCard) when the form is taller than the screen or scrolled out
    // of view, so the user always sees it.
    const card = document.createElement("div");
    card.className = "sleekcms-card";
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");
    Object.assign(card.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "14px",
      maxWidth: "90%",
      boxSizing: "border-box",
      fontFamily: "sans-serif",
      textAlign: "center",
    });

    const spinner = document.createElement("div");
    spinner.className = "sleekcms-spinner";
    Object.assign(spinner.style, {
      width: "34px",
      height: "34px",
      border: "3px solid rgba(0, 0, 0, 0.15)",
      borderTopColor: "#555",
      borderRadius: "50%",
      animation: "sleekcms-spin 0.7s linear infinite",
    });

    const messageBox = document.createElement("div");
    messageBox.className = "sleekcms-message";
    Object.assign(messageBox.style, {
      fontSize: "15px",
      lineHeight: "1.4",
      maxWidth: "34ch",
      color: "#555",
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "sleekcms-close";
    closeBtn.textContent = "Close";
    closeBtn.setAttribute("aria-label", "Close");
    Object.assign(closeBtn.style, {
      display: "none",
      cursor: "pointer",
      padding: "6px 18px",
      border: "1px solid currentColor",
      borderRadius: "6px",
      background: "transparent",
      color: "inherit",
      font: "inherit",
    });
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });

    card.appendChild(spinner);
    card.appendChild(messageBox);
    card.appendChild(closeBtn);
    overlay.appendChild(card);
    form.appendChild(overlay);

    // Centering inside the overlay works when the form fits on screen. For a
    // tall form (e.g. one filling the viewport) the centered point can land
    // off-screen — so anchor the card to the viewport as a self-contained
    // floating card that stays visible while the user scrolls.
    const positionCard = () => {
      const rect = form.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const centerY = rect.top + rect.height / 2;
      const offscreen = rect.height > vh || centerY < 80 || centerY > vh - 80;

      if (offscreen) {
        Object.assign(card.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "min(90vw, 360px)",
          padding: "22px 26px",
          background: "#fff",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "10px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
          zIndex: "2147483647",
        });
      } else {
        Object.assign(card.style, {
          position: "static",
          transform: "none",
          maxWidth: "90%",
          padding: "0",
          background: "transparent",
          border: "0",
          boxShadow: "none",
          zIndex: "auto",
        });
      }
    };

    const showLoading = () => {
      messageBox.textContent = "Submitting...";
      messageBox.style.color = "#555";
      spinner.style.display = "";
      closeBtn.style.display = "none";
      overlay.style.display = "flex";
      positionCard();
    };

    // Show the result and keep the overlay up until the user closes it.
    const showResult = (message, ok) => {
      messageBox.textContent = message;
      messageBox.style.color = ok ? "green" : "red";
      spinner.style.display = "none";
      closeBtn.style.display = "";
      overlay.style.display = "flex";
      positionCard();
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      // While the overlay is up (loading or showing a result) ignore submits.
      // The user dismisses it with the close button to submit again.
      if (overlay.style.display !== "none") return;
      showLoading();

      const formData = new FormData(form);
      let action = form.getAttribute("action") || form.getAttribute("data-action");

      if (!action) {
        const sleekcmsAttr = form.getAttribute("data-sleekcms");
        if (sleekcmsAttr && /^[a-z0-9]+-[a-z0-9]+$/.test(sleekcmsAttr)) {
          action = `https://form.sleekcms.com/${sleekcmsAttr}`;
        } else {
          showResult(
            "Error: No action URL specified. Please add an 'action' or 'data-action' attribute to the form.",
            false
          );
          return;
        }
      }
      let method = form.method || "POST";
      if (action.match(/form\.sleekcms\./)) method = "POST";
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

        showResult(
          res.ok
            ? resJson.message || "Form submitted successfully!"
            : resJson.message || "Something went wrong.",
          res.ok
        );

        if (res.ok) form.reset();
      } catch {
        showResult("Network error. Please try again.", false);
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
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }, 2000);
})();
