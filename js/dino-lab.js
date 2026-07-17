const traits = {
  food: [
    { id: 'plants', label: '🌿 עלים וצמחים' },
    { id: 'meat', label: '🍖 בשר' },
    { id: 'fish', label: '🐟 דגים' }
  ],
  movement: [
    { id: 'walks', label: '🐾 הולך' },
    { id: 'flies', label: '🪽 עף' },
    { id: 'slow', label: '🐢 הולך לאט' }
  ],
  size: [
    { id: 'small', label: 'קטן' },
    { id: 'medium', label: 'בינוני' },
    { id: 'giant', label: '⛰️ ענק' }
  ],
  state: [
    { id: 'egg', label: '🥚 ביצה' },
    { id: 'baby', label: '🐣 צעיר' },
    { id: 'adult', label: '🦕 בוגר' }
  ]
};

const zones = {
  nursery: '🥚 משתלת ביצים וצעירים',
  flying: '🪽 אזור המעופפים',
  giant: '⛰️ אזור הענקים',
  carnivore: '🍖 אזור הטורפים',
  herbivore: '🌿 אזור אוכלי הצמחים'
};

let selected = { food: null, movement: null, size: null, state: null };

function traitLabel(type, id) {
  return traits[type].find((item) => item.id === id)?.label || 'לא נבחר';
}

function classifyDino() {
  if (selected.state === 'egg' || selected.state === 'baby') return 'nursery';
  if (selected.movement === 'flies') return 'flying';
  if (selected.size === 'giant') return 'giant';
  if (selected.food === 'meat') return 'carnivore';
  return 'herbivore';
}

function dinoIcon() {
  if (selected.state === 'egg') return '🥚';
  if (selected.movement === 'flies') return '🪽';
  if (selected.food === 'meat') return '🦖';
  if (selected.size === 'giant') return '🦕';
  return '🦕';
}

function renderOptions() {
  Object.entries(traits).forEach(([type, options]) => {
    const box = document.querySelector(`[data-trait="${type}"]`);
    box.innerHTML = options.map((item) => `
      <button type="button" class="trait-btn ${selected[type] === item.id ? 'active' : ''}" data-type="${type}" data-id="${item.id}">${item.label}</button>
    `).join('');
  });
  document.querySelectorAll('.trait-btn').forEach((button) => {
    button.addEventListener('click', () => {
      selected[button.dataset.type] = button.dataset.id;
      renderAll();
    });
  });
}

function renderCard() {
  document.getElementById('created-dino').textContent = dinoIcon();
  document.getElementById('dino-card').innerHTML = `
    <b>מאפיינים:</b><br>
    אוכל: ${traitLabel('food', selected.food)}<br>
    תנועה: ${traitLabel('movement', selected.movement)}<br>
    גודל: ${traitLabel('size', selected.size)}<br>
    מצב: ${traitLabel('state', selected.state)}
  `;
}

function renderAll() {
  renderOptions();
  renderCard();
}

function hasAllTraits() {
  return Object.values(selected).every(Boolean);
}

function randomize() {
  Object.keys(traits).forEach((type) => {
    const options = traits[type];
    selected[type] = options[Math.floor(Math.random() * options.length)].id;
  });
  document.getElementById('lab-result').textContent = '';
  renderAll();
}

function reset() {
  selected = { food: null, movement: null, size: null, state: null };
  document.getElementById('lab-result').textContent = '';
  renderAll();
}

function classify() {
  const result = document.getElementById('lab-result');
  if (!hasAllTraits()) {
    result.textContent = 'צריך לבחור מאפיין בכל קבוצה לפני המיון.';
    result.style.color = '#b45309';
    return;
  }
  const zone = classifyDino();
  result.textContent = `סיסי ממיינת את הדינוזאור אל: ${zones[zone]}`;
  result.style.color = '#15803d';
}

document.getElementById('classify').addEventListener('click', classify);
document.getElementById('randomize').addEventListener('click', randomize);
document.getElementById('reset').addEventListener('click', reset);
renderAll();
