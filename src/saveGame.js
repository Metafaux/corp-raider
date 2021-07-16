import { PORTFOLIO_STORAGE_PREFIX, businessesForSale } from './const';

export const CLICK_INCOME_STORAGE_KEY = 'playerClickIncome';

const addLeadingZeroes = (numberVal) => {
  if (numberVal < 10) {
    return '00' + numberVal;
  } else if (numberVal < 100) {
    return '0' + numberVal;
  }
  return numberVal.toString();
};

export const saveToLocalStorage = (storageKey, storageValue) => {
  window.localStorage.setItem(storageKey, storageValue);
};

export const saveClickIncome = (newValue) => {
  saveToLocalStorage(CLICK_INCOME_STORAGE_KEY, newValue);
};

export const savePortfolioItem = (portfolioIndex, portfolioItem) => {
  if (portfolioItem) {
    const storageKeyIndex = addLeadingZeroes(portfolioIndex);

    const keyName = PORTFOLIO_STORAGE_PREFIX + storageKeyIndex;
    const valueString = JSON.stringify(portfolioItem);
    saveToLocalStorage(keyName, valueString);
  }
};

/**
 * retrieveGameFromStorage
 * @returns {number} restoredData.playerClickIncome
 * @returns {array} restoredData.playerPortfolio
 */

export const retrieveGameFromStorage = () => {
  let restoredData = {};
  restoredData.playerClickIncome = window.localStorage.getItem(
    CLICK_INCOME_STORAGE_KEY
  );

  restoredData.playerPortfolio = [];
  for (let i = 0; i < businessesForSale.length; i++) {
    const storageKeyIndex = addLeadingZeroes(i);
    const keyName = PORTFOLIO_STORAGE_PREFIX + storageKeyIndex;

    const retrievedItem = window.localStorage.getItem(keyName);
    if (retrievedItem) {
      restoredData.playerPortfolio[i] = JSON.parse(retrievedItem);
    }
  }

  return restoredData;
};
