function finalKey(key) {
  return phapname + "_" + key; 
}

async function load(key) {
  return await localforage.getItem(finalKey(key));
}

async function save(key, value) {
  await localforage.setItem(finalKey(key), value);
}

function saveSubsCount(value) {
  subsCount = value;
  save('subsCount', subsCount);
}

async function loadSubsCount() {
  return subsCount = parseInt(await load('subsCount'));
}

async function isEditedIndex(i) {
  let time = await loadTime(i);
  return !isNaN(time) && (time != 0 || i  <= 1);
}

async function saveTime(i, value) {
  await save(`time${i}`, value);
  var el = document.getElementById(i);
  if (el) {
    el.previousSibling.innerHTML = `[${i}] ${secondsToTime(value)}`;
    el.className = 'edited';
  }
}

async function loadTime(i) {
  return parseFloat(await load(`time${i}`));
}

async function saveTextIndex(i) {
  i = typeof i === "number" ? i : parseInt(this.id);
  if (i < 0 || i >= subsCount) {
    console.log(`!!! WARNING: ${i} is out of range`);
    return;
  }
  var p = document.getElementById(i);
  console.log(`saveTextIndex: ${i}, ${p}`);
  if (p) saveText(i, p.innerText);
}

async function saveText(i, value) {
  value = normalizeText(value);
  await save(`text${i}`, value);
  return value;
}

async function loadText(i) {
  return await load(`text${i}`);
}

async function saveAll() {
  for (var i = 0; i < subsCount; i++) {
    await saveTextIndex(i);
  }
}

function saveCurrSubIndex(i) {
  save('currSubIndex', currSubIndex = i);
}

function saveCurrAdjustedDeltas() {
  let txt = adjustedDeltas.join(',');
  save(`adjustedDeltas${currSubIndex}`, txt);
  return txt;
}

async function loadCurrAdjustedDeltas() {
  let txt = await load(`adjustedDeltas${currSubIndex}`);
  if (txt === null) return adjustedDeltas = [];
  return adjustedDeltas = txt.split(',').map(x => x === "" ? 0 : parseFloat(x));
}