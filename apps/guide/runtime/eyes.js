const motionStudy = document.getElementById("motion-demo");
motionStudy.addEventListener("change", event => {
  if (event.target.name !== "gaze") return;
  const working = event.target.value === "working";
  motionStudy.dataset.state = working ? "working" : "ready";
  motionStudy.querySelector('[role="status"]').textContent = working ? "Kai is working." : "Kai is ready.";
});
