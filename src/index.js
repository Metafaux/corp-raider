import { Application, Sprite, Container, Text, Ticker } from 'pixi.js';
import {
  ASSET_LIST,
  GAME_COLORS,
  MIDDLE_VAL,
  businessesForSale,
  BUSINESS_DISPLAY_COUNT,
} from './const';
import MenuButton from './menuButton';
import BusinessWidget from './businessWidget';
import { moneyFormatter } from './util';
import {
  newGame,
  playerWallet,
  addIncome,
  buyBusiness,
  playerPortfolio,
  upgradeBusiness,
  hireManager,
  restoreGameFromStorage,
} from './gameLogic';

let widgetList = [];

let upgradeOverlayIsShown = false;
let managerOverlayIsShown = false;

const refreshWidgets = () => {
  widgetList.forEach((widget, index) => {
    widget.refreshState(playerWallet, playerPortfolio[index]);
  });
};

const showOverlays = (overlayType) => {
  widgetList.forEach((widget, index) => {
    widget.showOverlay(playerWallet, overlayType, playerPortfolio[index]);
  });
};

const hideOverlays = () => {
  upgradeOverlayIsShown = false;
  managerOverlayIsShown = false;
  widgetList.forEach((widget, index) => {
    widget.hideOverlay();
    widget.refreshState(playerWallet, playerPortfolio[index]);
  });
};

newGame();
restoreGameFromStorage();

let sharedTicker = Ticker.shared;
sharedTicker.autoStart = false;
sharedTicker.stop();

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio,
});
// Create canvas tag in the body
document.body.appendChild(app.view);

ASSET_LIST.forEach((asset) => {
  app.loader.add(asset.name, asset.path);
});

app.loader.load(() => {
  const gameContainer = new Container();
  gameContainer.x = app.screen.width * MIDDLE_VAL;
  gameContainer.y = app.screen.height * MIDDLE_VAL;
  app.stage.addChild(gameContainer);
  const backgroundSprite = Sprite.from('gameBackground');
  backgroundSprite.anchor.set(MIDDLE_VAL);
  gameContainer.addChild(backgroundSprite);

  const walletText = new Text(moneyFormatter(playerWallet), {
    fontFamily: 'Offside',
    fontSize: 50,
    fill: GAME_COLORS.textGreen,
    align: 'center',
  });

  const upgradeClickHandler = () => {
    if (upgradeOverlayIsShown) {
      hideOverlays();
    } else {
      upgradeOverlayIsShown = true;
      managerOverlayIsShown = false;
      showOverlays('upgrade');
    }
  };

  const managersClickHandler = () => {
    if (managerOverlayIsShown) {
      hideOverlays();
    } else {
      upgradeOverlayIsShown = false;
      managerOverlayIsShown = true;
      showOverlays('manager');
    }
  };

  const buyHandler = (businessIndex) => {
    buyBusiness(businessIndex);
    walletText.text = moneyFormatter(playerWallet);
    refreshWidgets();
  };

  const earnHandler = (businessIndex, isClickIncome) => {
    addIncome(businessIndex, isClickIncome);
    walletText.text = moneyFormatter(playerWallet);
    refreshWidgets();
  };

  const upgradeBusinessHandler = (businessIndex) => {
    upgradeBusiness(businessIndex);
    hideOverlays();
    walletText.text = moneyFormatter(playerWallet);
    refreshWidgets();
  };

  const manageBusinessHandler = (businessIndex) => {
    hireManager(businessIndex);
    hideOverlays();
    walletText.text = moneyFormatter(playerWallet);
    refreshWidgets();
  };

  const walletSprite = Sprite.from('wallet');
  walletSprite.addChild(walletText);
  walletText.anchor.set(MIDDLE_VAL, MIDDLE_VAL);
  walletSprite.anchor.set(MIDDLE_VAL, MIDDLE_VAL);

  gameContainer.addChild(walletSprite);
  walletSprite.x = 110;
  walletSprite.y = -270;

  const upgradeButton = MenuButton('Upgrades', upgradeClickHandler);
  const managersButton = MenuButton('Managers', managersClickHandler);
  upgradeButton.x = managersButton.x = -468;
  upgradeButton.y = -40;
  managersButton.y = upgradeButton.y + 50;

  gameContainer.addChild(upgradeButton);
  gameContainer.addChild(managersButton);

  const firstWidgetX = -260;
  const firstWidgetY = -228;

  for (let i = 0; i < BUSINESS_DISPLAY_COUNT; i++) {
    // change to compare with playerPortfolio

    const widget = BusinessWidget(
      i,
      businessesForSale[i],
      playerPortfolio[i],
      buyHandler,
      earnHandler,
      upgradeBusinessHandler,
      manageBusinessHandler
    );

    const yMultiplier = i < 5 ? i : i - 5;

    const xPosition = i < 5 ? firstWidgetX : firstWidgetX + widget.width + 10;
    const yPosition = firstWidgetY + yMultiplier * (widget.height + 10);
    gameContainer.addChild(widget);
    widget.x = xPosition;
    widget.y = yPosition;

    widgetList.push(widget);
  }
});
