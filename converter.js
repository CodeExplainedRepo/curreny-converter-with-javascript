// SELECT ELEMENTS
const exchangeRateEl = document.querySelector('.exchange-rate');

const f_select = document.querySelector('.from-currency select');
const t_select = document.querySelector('.to-currency select');
const f_input = document.querySelector('#from-currency-amount');
const t_input = document.querySelector('#to-currency-amount');

// HELPERS : get inputs values
function fromCurrencyCode() {
  return f_select.value;
}
function toCurrencyCode() {
  return t_select.value;
}
function fromCurrencyAmount() {
  return f_input.value;
}
function toCurrencyAmount() {
  return t_input.value;
}

// VARS AND CONSTS
const DEFAULT_BASE_CURRENCY_CODE = 'USD';
const DATA_PRECISION = 2;
let exchangeRate;
let currenciesList;
let ECO_MODE = true;

// API PROVIDERS
const ipdata = {
  baseurl: 'https://api.ipdata.co',
  key: '13952c49cd907f6b9a168b62b0b2364ba3eb022e303cd6aec6afb8cd',

  currency: function () {
    return `${this.baseurl}/currency?api-key=${ipdata.key}`;
  },
};
const currencyLayer = {
  baseurl: 'http://api.currencylayer.com',
  key: '816aace5f867a203d108dde0987d9681',

  list: function () {
    return `${this.baseurl}/list?access_key=${this.key}`;
  },
  convert: function (from, to, amount) {
    return `${this.baseurl}/convert?from=${from}&to=${to}&amount=${amount}&access_key=${this.key}`;
  },
};

// GET ALL CURRENCIES CODES AND NAMES
async function getCurrenciesList() {
  const response = await fetch(currencyLayer.list());
  const data = await response.json();
  const currencies = data.currencies;

  return currencies;
}

// GET USER'S LOCAL CURRENCY
async function getUserCurrency() {
  const response = await fetch(ipdata.currency());
  const currency = await response.json();

  return {
    name: currency.name,
    code: currency.code,
  };
}

// INITIALIZE APP
async function init() {
  userCurrency = await getUserCurrency();
  currenciesList = await getCurrenciesList();

  renderSelectOptions(currenciesList, DEFAULT_BASE_CURRENCY_CODE, userCurrency.code);

  await renderExchangeRate(DEFAULT_BASE_CURRENCY_CODE, userCurrency.code);

  convert('from->to');
}
init();

// get exchange rate
async function getExchangeRate(fromCurrencyCode, toCurrencyCode) {
  const amount = 1;

  const response = await fetch(currencyLayer.convert(fromCurrencyCode, toCurrencyCode, amount));
  const data = await response.json();
  const rate = data.result;

  return rate;
}

// render exchange rate
async function renderExchangeRate(fromCurrencyCode, toCurrencyCode) {
  exchangeRate = await getExchangeRate(fromCurrencyCode, toCurrencyCode);

  plural = exchangeRate === 1 ? 's' : '';

  exchangeRateEl.innerHTML = `<p>1 ${currenciesList[fromCurrencyCode]} equals</p>
  <h1>${exchangeRate.toFixed(DATA_PRECISION)} ${currenciesList[toCurrencyCode]}${plural}</h1>`;
}

// render select options
function renderSelectOptions(list, defaultBaseCurrencyCode, userCurrencyCode) {
  f_select.innerHTML = '';
  t_select.innerHTML = '';

  for (const currencyCode in list) {
    const currencyName = list[currencyCode];

    selectedFromCurrency = defaultBaseCurrencyCode === currencyCode ? 'selected' : '';
    selectedToCurrency = userCurrencyCode === currencyCode ? 'selected' : '';

    f_select.innerHTML += `<option value="${currencyCode}" ${selectedFromCurrency}>
                                          ${currencyCode} - ${currencyName}</option>`;
    t_select.innerHTML += `<option value="${currencyCode}" ${selectedToCurrency}>
                                          ${currencyCode} - ${currencyName}</option>`;
  }
}

// convert
async function convert(direction) {
  if (direction === 'from->to') {
    t_input.value = (fromCurrencyAmount() * exchangeRate).toFixed(DATA_PRECISION);
  } else if (direction === 'to->from') {
    f_input.value = (toCurrencyAmount() / exchangeRate).toFixed(DATA_PRECISION);
  }
}

// EVENT LISTENERS
f_select.addEventListener('change', async () => {
  await renderExchangeRate(fromCurrencyCode(), toCurrencyCode());
  convert('from->to');
});
t_select.addEventListener('change', async () => {
  await renderExchangeRate(fromCurrencyCode(), toCurrencyCode());
  convert('to->from');
});
f_input.addEventListener('input', async () => {
  if (!ECO_MODE) {
    exchangeRate = await getExchangeRate(fromCurrencyCode(), toCurrencyCode());
  }
  convert('from->to');
});
t_input.addEventListener('input', async () => {
  if (!ECO_MODE) {
    exchangeRate = await getExchangeRate(fromCurrencyCode(), toCurrencyCode());
  }
  convert('to->from');
});
