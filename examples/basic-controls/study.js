(() => {
  "use strict";

  const study = document.getElementById("yg-saved-view");
  if (!study) return;

  const form = study.querySelector("form");
  const field = study.querySelector("#yg-name");
  const clear = study.querySelector(".yg-clear");
  const submit = study.querySelector(".yg-save");
  const submitLabel = study.querySelector(".yg-save-label");
  const error = study.querySelector("#yg-error");
  const note = study.querySelector(".yg-note");
  const savedTitle = study.querySelector(".yg-name");
  const dates = study.querySelector('[role="switch"]');
  const times = study.querySelectorAll("time");
  const link = document.getElementById("yg-fixture-link");
  const options = new URLSearchParams(location.search);
  let rejectNext = options.get("save") === "fails-once";
  let saved = savedTitle.textContent;
  let pending = false;
  let composing = false;
  let suppressImplicitSubmit = false;
  let compositionTurn;

  if (link && rejectNext) {
    link.textContent = "Return to normal save";
    link.setAttribute("href", "index.html");
  }

  function setNote(message, isError = false) {
    if (note.textContent !== message) note.textContent = message;
    note.toggleAttribute("data-error", isError);
  }

  function refreshControls() {
    clear.hidden = field.value.length === 0;
    submit.setAttribute("aria-disabled", String(pending || field.value === saved));
    submit.setAttribute("aria-busy", String(pending));
    submitLabel.textContent = pending ? "Saving…" : "Save name";
  }

  function validate(invalid) {
    error.hidden = !invalid;
    if (invalid) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", error.id);
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function onEdit() {
    if (field.value.trim()) validate(false);
    refreshControls();
    if (!pending) setNote(field.value === saved ? "Name is up to date" : "Unsaved name");
  }

  field.addEventListener("input", onEdit);
  field.addEventListener("compositionstart", () => { composing = true; });
  field.addEventListener("compositionend", () => { composing = false; });
  field.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.isComposing || event.keyCode === 229 || composing)) {
      // Let the editor confirm the IME selection while keeping the form action separate.
      suppressImplicitSubmit = true;
      clearTimeout(compositionTurn);
      compositionTurn = setTimeout(() => { suppressImplicitSubmit = false; }, 0);
    } else if (event.key === "Enter") {
      requestSave(event);
    }
  });

  clear.addEventListener("click", () => {
    field.value = "";
    field.focus();
    onEdit();
  });

  async function saveInStudy() {
    // Simulates a local host response so the design can be inspected while pending.
    await new Promise(resolve => setTimeout(resolve, 440));
    if (rejectNext) {
      rejectNext = false;
      return false;
    }
    return true;
  }

  async function requestSave(event) {
    event.preventDefault();
    if (composing || suppressImplicitSubmit || pending || field.value === saved) return;
    if (!field.value.trim()) {
      validate(true);
      setNote("");
      field.focus();
      return;
    }

    const candidate = field.value;
    pending = true;
    setNote("");
    refreshControls();
    const accepted = await saveInStudy();
    pending = false;
    if (accepted) {
      saved = candidate;
      savedTitle.textContent = saved;
      setNote(field.value === saved ? "Name saved" : "Earlier name saved. New edit pending.");
    } else {
      setNote("Couldn’t save. Try again.", true);
    }
    refreshControls();
  }

  // The review surface runs both as an offline page and in a form-restricted frame.
  form.addEventListener("submit", requestSave);
  submit.addEventListener("click", requestSave);

  dates.addEventListener("change", () => {
    dates.closest("label").setAttribute("data-operated", "");
    times.forEach(time => { time.hidden = !dates.checked; });
  });

  for (const option of study.querySelectorAll('[name="yg-radius"]')) {
    option.addEventListener("change", () => {
      if (option.checked) study.style.setProperty("--yg-radius", option.value + "px");
    });
  }

  refreshControls();
})();
