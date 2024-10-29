'use strict';
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Shahadat Hoosain',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2024-10-26T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
  // de-DE
};

const account2 = {
  owner: 'Raiyan Khan',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2024-10-28T12:01:20.894Z',
  ],
  currency: 'BDT',
  locale: 'bn',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// ! Date

const calcDisplayDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(Math.round((date2 - date1) / (1000 * 60 * 60 * 24)));
  const passedDays = calcDaysPassed(new Date(), date);
  if (passedDays === 0) {
    return `Today`;
  } else if (passedDays === 1) {
    return `Yesterday`;
  } else if (passedDays <= 7) {
    return `${passedDays} days ago`;
  } else {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date);
  }
};

// ! Formatted amounts
const formatCurrency = (value, cur, locale) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
  }).format(value);
};

// ! Display movements

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movements = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = calcDisplayDate(date, acc.locale);

    containerMovements.insertAdjacentHTML(
      'afterbegin',
      `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
        i + 1
      } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatCurrency(
            mov,
            acc.currency,
            acc.locale
          )}</div>
        </div>`
    );
  });
};

// ! Display balance
const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.currency,
    acc.locale
  );
};

// ! Display summary
const displaySummary = function (acc) {
  const income = acc.movements.reduce(
    (acc, cur) => (cur > 0 ? acc + cur : acc),
    0
  );
  labelSumIn.textContent = formatCurrency(income, acc.currency, acc.locale);

  const out = acc.movements.reduce(
    (acc, cur) => (cur < 0 ? acc + cur : acc),
    0
  );
  labelSumOut.textContent = formatCurrency(out, acc.currency, acc.locale);

  const interest = acc.movements
    .filter(cur => cur > 0)
    .map(cur => (cur * acc.interestRate) / 100)
    .reduce((acc, cur) => (cur >= 1 ? acc + cur : acc));
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.currency,
    acc.locale
  );
};

// ! Create username
const createUserName = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(cur => cur[0])
      .join('');
  });
};
createUserName(accounts);

// ! Update UI
const updateUI = function (acc) {
  // ! Display movements
  displayMovements(acc);
  // ! Display balance
  displayBalance(acc);
  // ! Display summary
  displaySummary(acc);
};

// ! Create timer
const countDownTimer = function () {
  // ! tick function
  const tick = function () {
    const min = `${Math.floor(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  // ! Setting the time
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// ! login
let currentUser, timer;

// // ! Fake login
// currentUser = account1;
// updateUI(currentUser);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (event) {
  event.preventDefault();
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);
  currentUser = accounts.find(cur => cur.username === username);
  if (pin === currentUser?.pin) {
    inputLoginUsername.value = inputLoginPin.value = '';
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(' ')[0]
    }!`;
    // ? Create date for Current balance date
    const now = new Date();
    labelDate.textContent = new Intl.DateTimeFormat(currentUser.locale, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    if (timer) {
      clearInterval(timer);
    }
    timer = countDownTimer();

    // ! updateUI
    updateUI(currentUser);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});

// ! Transfer money

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const transferTo = accounts.find(
    cur => cur.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    transferTo !== currentUser &&
    currentUser.movements.some(cur => cur >= amount)
  ) {
    currentUser.movements.push(-amount);
    transferTo.movements.push(amount);
    currentUser.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
    setTimeout(() => {
      updateUI(currentUser);
    }, 1000);
  }

  // ! Resetting timer
  clearInterval(timer);
  timer = countDownTimer();
});

// ! Request loan

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';
  if (amount > 0 && currentUser.movements.some(cur => cur >= amount * 0.1)) {
    currentUser.movements.push(amount);
    currentUser.movementsDates.push(new Date().toISOString());
    setTimeout(() => {
      updateUI(currentUser);
    }, 1200);
  }

  // ! Resetting timer
  clearInterval(timer);
  timer = countDownTimer();
});

// ! Delete Account
btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  inputClosePin.value = inputCloseUsername.value = '';

  const closeAcc = accounts.find(cur => cur.username === user);

  if (closeAcc?.username === currentUser.username && pin === currentUser.pin) {
    const index = accounts.findIndex(cur => cur.username === user);
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  }
});
// ! sorted
let sorted = false;
btnSort.addEventListener('click', function () {
  displayMovements(currentUser, !sorted);
  sorted = !sorted;
});
