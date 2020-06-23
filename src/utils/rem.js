const baseSize = 32;

window.onresize = function () {
  setRem();
};

window.onload = function () {
  setRem();
};

function setRem () {
  const clientWidth = document.documentElement.clientWidth;
  const scale = clientWidth / 750;
  document.documentElement.style.fontSize = (baseSize * Math.min(scale, 5)) + 'px';
}

const rem = {
  setRem: setRem
};

export default rem;
