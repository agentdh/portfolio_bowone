"use strict";

function createImageViewport(stage, getImage, report, dragClass = "is-dragging") {
  let scale = 1, x = 0, y = 0, drag = null;
  function draw() {
    const image = getImage();
    if (!image) return;
    image.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")";
    const percent = scale * 100;
    report(percent < .01 ? "<0.01%" : (percent < 1 ? percent.toFixed(2) : Math.round(percent)) + "%");
  }
  function endDrag(event) {
    if (!drag || (event && drag.id !== event.pointerId)) return;
    const id = drag.id;
    drag = null;
    stage.classList.remove(dragClass);
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  }
  function reset() {
    endDrag();
    scale = 1; x = 0; y = 0;
    draw();
  }
  function zoom(factor, clientX, clientY) {
    if (!getImage()) return;
    const next = scale * factor;
    if (!(next > 0) || !Number.isFinite(next * 100) || next === scale) return;
    const rect = stage.getBoundingClientRect();
    const px = Number.isFinite(clientX) ? clientX - (rect.left + rect.width / 2) : 0;
    const py = Number.isFinite(clientY) ? clientY - (rect.top + rect.height / 2) : 0;
    const nextX = px + (x - px) * factor, nextY = py + (y - py) * factor;
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return;
    x = nextX; y = nextY; scale = next;
    draw();
  }
  stage.addEventListener("wheel", event => {
    if (!getImage() || event.ctrlKey || event.metaKey || !event.deltaY) return;
    event.preventDefault();
    zoom(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX, event.clientY);
  }, {passive:false});
  stage.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !getImage() || drag) return;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY};
    stage.setPointerCapture(event.pointerId);
    stage.classList.add(dragClass);
  });
  stage.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    x += event.clientX - drag.x; y += event.clientY - drag.y;
    drag.x = event.clientX; drag.y = event.clientY;
    draw();
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) stage.addEventListener(name, endDrag);
  stage.addEventListener("dblclick", event => {
    if (event.button !== 0 || !getImage()) return;
    event.preventDefault();
    reset();
  });
  reset();
  return {draw, reset, zoom};
}

module.exports = createImageViewport;
