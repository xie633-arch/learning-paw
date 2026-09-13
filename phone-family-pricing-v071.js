const PRICE_VERIFIED_AT = '2026-09-13';

const officialStartingPrices = {
  'Mate 80': { value: 4699 },
  'Mate 80 Pro': { value: 6999 },
  'Mate 80 Pro Max': { value: 7999 },
  'Mate 80 RS 非凡大师': { value: 11999 },
  'Mate 80 Pro Max 风驰版': { value: 8499 },
  'Pura 90': { value: 4699 },
  'Pura 90 Pro': { value: 5499 },
  'Pura 90 Pro Max': { value: 6499 },
  'nova 16 Ultra': { value: 4699 },
  'nova 16 Pro': { value: 3899 },
  'nova 16': { value: 2999 },
  'nova 16 SE': { value: 2499 },
  'nova 16z': { value: 2699 },
  '畅享 90': { value: 1299 },
  '畅享 90 Plus': { value: 1499 },
  '畅享 90 Pro Max': { value: 1899 },
  '畅享 90m Plus': { value: null, label: '官网未标起售价' },
  'Mate X7': { value: 12999 },
  'Mate XT 2 非凡大师': { value: 19999 },
};

function formatPrice(value) {
  return `¥${Number(value).toLocaleString('zh-CN')}`;
}

function shortPrice(item) {
  return item?.value == null ? '官网未标价' : `${formatPrice(item.value)} 起`;
}

function installPricingStyles() {
  if (document.querySelector('#phoneFamilyPricingV071Styles')) return;
  const style = document.createElement('style');
  style.id = 'phoneFamilyPricingV071Styles';
  style.textContent = `
    .phone-catalog__price {
      display:grid;
      gap:5px;
      padding:12px 13px;
      border:1px solid #e4e7ec;
      border-radius:14px;
      background:#fff;
    }
    .phone-catalog__price-row {
      display:flex;
      align-items:flex-end;
      justify-content:space-between;
      gap:12px;
    }
    .phone-catalog__price-label {
      color:#667085;
      font-size:11px;
      font-weight:750;
    }
    .phone-catalog__price-value {
      color:#d92d20;
      font-size:24px;
      line-height:1;
      font-weight:900;
      letter-spacing:-.03em;
      white-space:nowrap;
    }
    .phone-catalog__price-value small {
      margin-left:3px;
      color:#667085;
      font-size:10px;
      font-weight:750;
      letter-spacing:0;
    }
    .phone-catalog__price-value.is-unlisted {
      color:#344054;
      font-size:16px;
      line-height:1.25;
      white-space:normal;
      text-align:right;
    }
    .phone-catalog__price-meta {
      margin:0;
      color:#98a2b3;
      font-size:9px;
      line-height:1.45;
    }
    .phone-catalog__model-price {
      opacity:.72;
      font-weight:700;
    }
    @media (max-width:720px) {
      .phone-catalog__price-value { font-size:22px; }
    }
    @media (prefers-color-scheme:dark) {
      .phone-catalog__price { background:#181c22; border-color:#3a4049; }
      .phone-catalog__price-label { color:#aab2bf; }
      .phone-catalog__price-value { color:#ff7b72; }
      .phone-catalog__price-value small, .phone-catalog__price-meta { color:#9099a8; }
      .phone-catalog__price-value.is-unlisted { color:#e6e9ee; }
    }
  `;
  document.head.append(style);
}

function syncModelTabPrices() {
  document.querySelectorAll('.phone-catalog__model').forEach(button => {
    const raw = button.dataset.modelName || button.textContent.trim();
    const item = officialStartingPrices[raw];
    if (!item) return;

    const priceText = ` · ${shortPrice(item)}`;
    const existingPrice = button.querySelector('.phone-catalog__model-price');
    const alreadySynced = button.dataset.modelName === raw
      && button.dataset.priceVerifiedAt === PRICE_VERIFIED_AT
      && existingPrice?.textContent === priceText;

    button.setAttribute('aria-label', `${raw}，${shortPrice(item)}`);
    if (alreadySynced) return;

    button.dataset.modelName = raw;
    button.dataset.priceVerifiedAt = PRICE_VERIFIED_AT;
    button.replaceChildren();

    const name = document.createElement('span');
    name.textContent = raw;
    const price = document.createElement('span');
    price.className = 'phone-catalog__model-price';
    price.textContent = priceText;
    button.append(name, price);
  });
}

function syncCurrentPrice() {
  const side = document.querySelector('.phone-catalog__side');
  const title = side?.querySelector('h4');
  if (!side || !title) return;

  const modelName = title.textContent.trim();
  const item = officialStartingPrices[modelName];
  if (!item) return;

  const priceKey = `${modelName}|${PRICE_VERIFIED_AT}|${item.value ?? item.label ?? ''}`;
  const existing = side.querySelector('.phone-catalog__price');
  if (existing?.dataset.priceKey === priceKey) return;
  existing?.remove();

  const block = document.createElement('div');
  block.className = 'phone-catalog__price';
  block.dataset.priceKey = priceKey;

  const row = document.createElement('div');
  row.className = 'phone-catalog__price-row';

  const label = document.createElement('span');
  label.className = 'phone-catalog__price-label';
  label.textContent = '华为官网起售价';

  const value = document.createElement('strong');
  value.className = 'phone-catalog__price-value';
  if (item.value == null) {
    value.classList.add('is-unlisted');
    value.textContent = item.label || '官网未标起售价';
  } else {
    value.append(document.createTextNode(formatPrice(item.value)));
    const suffix = document.createElement('small');
    suffix.textContent = '起';
    value.append(suffix);
  }

  row.append(label, value);
  const meta = document.createElement('p');
  meta.className = 'phone-catalog__price-meta';
  meta.textContent = `官网产品页核验：${PRICE_VERIFIED_AT} · 促销、补贴与实时成交价以购买页为准`;
  block.append(row, meta);

  const positioning = side.querySelector('.phone-catalog__positioning');
  if (positioning) positioning.after(block);
  else title.after(block);
}

let syncQueued = false;
let syncRunning = false;

function syncPricing() {
  if (syncRunning) return;
  syncRunning = true;
  try {
    syncModelTabPrices();
    syncCurrentPrice();
  } finally {
    syncRunning = false;
  }
}

function schedulePricingSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncPricing();
  });
}

installPricingStyles();
const lessonReaderBody = document.querySelector('#lessonReaderBody');
if (lessonReaderBody) {
  new MutationObserver(schedulePricingSync).observe(lessonReaderBody, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener('click', event => {
  if (event.target.closest('.phone-catalog__family, .phone-catalog__model, .phone-catalog__color, .phone-catalog__thumb, #openLessonReaderBtn')) {
    window.setTimeout(schedulePricingSync, 0);
  }
});

schedulePricingSync();
