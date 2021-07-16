import {
  buyBusiness,
  playerPortfolio,
  playerWallet,
  addIncome,
  clickIncomeTimer,
  newGame,
  upgradeBusiness,
  hireManager,
  playerClickIncome,
  calculateManagerIncome,
} from '../src/gameLogic';
import {
  businessesForSale,
  UPGRADE_MULTIPLIER,
  ONE_DAY_MS,
} from '../src/const';

const SAMPLE_PORTFOLIO_ITEM = {
  name: '3 Card Monte',
  cost: 4,
  payout: 1,
  payoutDelay: 500,
  upgradeCost: 20,
  managerCost: 1000,
  branchCount: 1,
  isUpgraded: false,
  hasManager: false,
  managerHireTime: -1,
};

const BUSINESS_INDEX_ZERO = 0;

/* eslint-disable no-magic-numbers */
describe('Game Logic', () => {
  beforeEach(() => {
    newGame();
  });

  it('starts with one branch of the first business', () => {
    expect(playerPortfolio[BUSINESS_INDEX_ZERO].name).toMatch(
      businessesForSale[BUSINESS_INDEX_ZERO].name
    );
    expect(playerPortfolio[0].branchCount).toEqual(1);
  });

  it("adds income to the player's wallet", () => {
    addIncome(BUSINESS_INDEX_ZERO);
    expect(playerWallet).toEqual(businessesForSale[BUSINESS_INDEX_ZERO].payout);
  });

  // This is removed because businessWidget handles timers
  // jest.useFakeTimers();
  // it.skip('starts a timer to generate income from business', () => {
  //   clickIncomeTimer(BUSINESS_INDEX_ZERO);

  //   expect(setTimeout).toHaveBeenCalledTimes(1);
  //   expect(setTimeout).toHaveBeenLastCalledWith(
  //     expect.any(Function),
  //     playerPortfolio[BUSINESS_INDEX_ZERO].payoutDelay
  //   );
  // });

  it('adds a second branch, charges the player, and updates the payout', () => {
    while (playerWallet < businessesForSale[0].cost) addIncome(0);
    buyBusiness(0);
    expect(playerWallet).toEqual(0);
    expect(playerPortfolio[0].branchCount).toEqual(2);
    addIncome(0);
    expect(playerWallet).toEqual(businessesForSale[0].payout * 2);
  });

  it('upgrades a business and updates the payout value', () => {
    expect(playerPortfolio[0].branchCount).toEqual(1);
    while (playerWallet < playerPortfolio[0].upgradeCost) addIncome(0);
    upgradeBusiness(0);
    expect(playerWallet).toEqual(0);
    expect(playerPortfolio[0].isUpgraded).toEqual(true);

    addIncome(0);
    expect(playerWallet).toEqual(
      playerPortfolio[0].payout * UPGRADE_MULTIPLIER
    );
  });

  it('hires a Manager, saves purchase time, and deducts price from wallet', () => {
    const testStartTime = Date.now() - 1;
    while (playerWallet < playerPortfolio[0].managerCost) addIncome(0);
    hireManager(0);
    expect(playerPortfolio[0].hasManager).toEqual(true);
    expect(playerWallet).toEqual(0);
    expect(playerPortfolio[0].managerHireTime).toBeGreaterThan(testStartTime);
  });

  it('tracks click income from the player', () => {
    while (playerWallet < playerPortfolio[0].managerCost) addIncome(0);
    expect(playerClickIncome).toEqual(playerPortfolio[0].managerCost);
    hireManager(0);
    expect(playerClickIncome).toEqual(0);
  });

  it('calculates the income from the manager start date', () => {
    while (playerWallet < playerPortfolio[0].managerCost) addIncome(0);
    hireManager(0);
    calculateManagerIncome(0, Date.now() + ONE_DAY_MS);

    const expectedPayoutCount = Math.floor(
      ONE_DAY_MS / playerPortfolio[0].payoutDelay
    );
    const expectedPayout = playerPortfolio[0].payout * expectedPayoutCount;

    expect(playerWallet).toEqual(expectedPayout);
    expect(playerClickIncome).toEqual(0);
  });

  // USER INTERFACE TESTS

  // it('unlocks a business when the player can afford it', () => {
  // it('')

  // STRETCH GOALS
  // it('inflates the price of businesses after each purchase')
  // it('halves the delay time when franchises exceed 25')
  // it('buys a new business out of sequence')
  // it('saves player data in a cookie when the window is closed') IF NECESSARY
});
