import {
  businessesForSale,
  DEFAULT_ZERO,
  PORTFOLIO_DEFAULT_VALUES,
  BUSINESS_DISPLAY_COUNT,
} from './const';
import { calculatePayout } from './util';
import {
  saveClickIncome,
  savePortfolioItem,
  retrieveGameFromStorage,
} from './saveGame';

/**
 * Corp Raider: Game Logic
 *
 * Tracks and saves income gathered from user clicks
 * Tracks and saves purchased businesses, upgrades, and managers
 * Calculates accumulated income from Manager hire dates
 */

export let playerPortfolio;

// Player's displayed calculated total unspent earnings
// Sum of playerClickIncome and manager calculated income
// Managed by addIncome() and chargePlayerWallet()
// TODO: change to proper getter/setter and protect actual var
export let playerWallet;

// Total value of income gained from player clicks
// (as opposed to manager-generated income)
// TODO: Should it be broken down into history of clicks and payouts?
// Does granular history need to be available for any reason?
export let playerClickIncome = 0;

export const newGame = () => {
  playerPortfolio = [
    {
      ...businessesForSale[DEFAULT_ZERO],
      ...PORTFOLIO_DEFAULT_VALUES,
    },
  ];
  const EMPTY_WALLET = 0;
  playerWallet = EMPTY_WALLET;
  playerClickIncome = EMPTY_WALLET;
};

/**
 * addIncome
 * @param {number} portfolioIndex integer index of owned business to collect income
 * @param {number} managerCycleCount OPTIONAL: integer of manager payouts generated.
 * If managerCycleCount is undefined, income is tracked and saved as 'click income'
 */
export const addIncome = (portfolioIndex, isClickIncome, managerCycleCount) => {
  // portfolioIndex = 0 is valid but resolves to falsy, check for undefined.
  if (portfolioIndex !== undefined && playerPortfolio[portfolioIndex]) {
    const singlePayoutTotal = calculatePayout(playerPortfolio[portfolioIndex]);
    const MINIMUM_MANAGER_CYCLES = 1;

    // when managerCycleCount >= 1, it is not click income, regardless of isClickIncome
    if (managerCycleCount && managerCycleCount >= MINIMUM_MANAGER_CYCLES) {
      playerWallet += singlePayoutTotal * managerCycleCount;
    } else {
      if (isClickIncome) {
        playerClickIncome += singlePayoutTotal;
        saveClickIncome(playerClickIncome);
      }
      playerWallet += singlePayoutTotal;
    }
  }
};

/**
 * chargePlayerWallet
 * Deduct amount from player wallet when a purchase is made.
 * Reduce playerClickIncome to the same amount if playerWallet is lower value.
 * @param {number} amount
 */
export const chargePlayerWallet = (amount) => {
  if (amount) {
    playerWallet -= amount;
    if (playerWallet < playerClickIncome) {
      playerClickIncome = playerWallet;
      saveClickIncome(playerClickIncome);
    }
  }
};

export const buyBusiness = (businessIndex) => {
  if (
    businessIndex !== undefined &&
    playerWallet >= businessesForSale[businessIndex].cost
  ) {
    if (playerPortfolio[businessIndex]) {
      playerPortfolio[businessIndex].branchCount++;
    } else {
      playerPortfolio[businessIndex] = {
        ...businessesForSale[businessIndex],
        branchCount: 1,
        isUpgraded: false,
        hasManager: false,
        managerHireTime: -1,
      };
    }
    chargePlayerWallet(businessesForSale[businessIndex].cost);
    savePortfolioItem(businessIndex, playerPortfolio[businessIndex]);
  }
};

export const upgradeBusiness = (portfolioIndex) => {
  const { isUpgraded, upgradeCost } = playerPortfolio[portfolioIndex];
  if (!isUpgraded && playerWallet >= upgradeCost) {
    playerPortfolio[portfolioIndex].isUpgraded = true;
    savePortfolioItem(portfolioIndex, playerPortfolio[portfolioIndex]);
    chargePlayerWallet(upgradeCost);
  }
};

export const hireManager = (portfolioIndex) => {
  const { hasManager, managerCost } = playerPortfolio[portfolioIndex];
  if (!hasManager && playerWallet >= managerCost) {
    playerPortfolio[portfolioIndex].hasManager = true;
    playerPortfolio[portfolioIndex].managerHireTime = Date.now();
    savePortfolioItem(portfolioIndex, playerPortfolio[portfolioIndex]);
    chargePlayerWallet(managerCost);
  }
};

/**
 * calculateManagerIncome
 * establishes earnings since manager hire date, so managed businesses earn
 * while game is closed
 * @param {number} portfolioIndex
 * @param {number} testTime OPTIONAL time value for unit testing only
 */
export const calculateManagerIncome = (portfolioIndex, testTime) => {
  // optional targetTime arg exists for simulating time passage for unit testing
  const { payoutDelay, managerHireTime } = playerPortfolio[portfolioIndex];
  const nowTime = testTime || Date.now();

  // number of seconds since manager hired
  const timeDelta = nowTime - managerHireTime;

  // number of times the manager produced payouts
  // round down to get integer of completed income cycles
  // addIncome() ignores payoutCounts < 1
  const payoutCount = Math.floor(timeDelta / payoutDelay);

  addIncome(portfolioIndex, false, payoutCount);
};

export const restoreGameFromStorage = () => {
  const retrievedGame = retrieveGameFromStorage();
  if (retrievedGame.playerClickIncome) {
    const incomeNumber = Number(retrievedGame.playerClickIncome);
    // addIncome(incomeNumber, true);
    playerClickIncome += incomeNumber;
    playerWallet += incomeNumber;
  }

  if (retrievedGame.playerPortfolio.length) {
    playerPortfolio = retrievedGame.playerPortfolio;

    for (let i = 0; i < BUSINESS_DISPLAY_COUNT; i++) {
      if (playerPortfolio[i] && playerPortfolio[i].hasManager) {
        calculateManagerIncome(i);
      }
    }
  }
};
