import { Container, Text, Sprite } from 'pixi.js';
import BuyButton from './buyButton';
import EarnButton from './earnButton';
import { MIDDLE_VAL, GAME_COLORS } from './const';
import { countdownFormatter, moneyFormatter, calculatePayout } from './util';

const disabledGray = 0x777777;

const BusinessWidget = (
  businessIndex,
  businessInfoObject,
  portfolioObject,
  buyHandler,
  earnHandler,
  upgradeHandler,
  manageHandler
) => {
  const widget = new Container();
  widget.isOwned = !!portfolioObject;
  widget.hasManager = portfolioObject && portfolioObject.hasManager;
  const widgetBackground = Sprite.from('businessSpriteBG');
  widget.addChild(widgetBackground);

  const timerText = new Text(countdownFormatter(0), {
    fontFamily: 'Offside',
    fontSize: 28,
    align: 'center',
    fill: widget.isOwned ? GAME_COLORS.textOrange : disabledGray,
  });

  const earnClickTimerStart = (enableButtonCallback) => {
    let payoutTime = Date.now() + businessInfoObject.payoutDelay;
    timerText.text = countdownFormatter(payoutTime - Date.now() - 100);

    let timerInterval = setInterval(() => {
      const timeDelta = payoutTime - Date.now();

      timerText.text = countdownFormatter(timeDelta);

      if (timeDelta < 1000) {
        // if hasManager = false, earnHandler saves click income
        earnHandler(businessIndex, !widget.hasManager);
        if (widget.hasManager) {
          payoutTime = Date.now() + businessInfoObject.payoutDelay;
        } else {
          clearInterval(timerInterval);
          enableButtonCallback(true);
          earnButton.activate(true);
        }
      }
    }, 250);
  };

  const getCurrentPayout = () => {
    if (portfolioObject) {
      return calculatePayout(portfolioObject);
    }
    return businessInfoObject.payout;
  };

  const buyButton = BuyButton(
    businessInfoObject.cost,
    businessIndex,
    buyHandler
  );
  const earnButton = EarnButton(
    getCurrentPayout(),
    businessIndex,
    earnClickTimerStart,
    widget.isOwned
  );

  earnButton.activate(widget.isOwned && !widget.hasManager);
  if (widget.hasManager) earnClickTimerStart();

  const timerBackground = Sprite.from('timer');

  const titleText = new Text(businessInfoObject.name, {
    fontFamily: 'Offside',
    fontSize: 20,
    align: 'center',
  });

  timerText.anchor.set(MIDDLE_VAL);
  titleText.anchor.set(MIDDLE_VAL);

  widget.addChild(buyButton);
  widget.addChild(earnButton);
  widget.addChild(timerBackground);
  widget.addChild(timerText);
  widget.addChild(titleText);

  titleText.x = widgetBackground.width * MIDDLE_VAL;
  titleText.y = 14;
  buyButton.x = 20;
  earnButton.x = buyButton.x + buyButton.width + 10;
  timerBackground.x = earnButton.x + 84;
  earnButton.y = buyButton.y = timerBackground.y = 30;
  timerText.x = timerBackground.width * MIDDLE_VAL + timerBackground.x;
  timerText.y = timerBackground.y + 30;

  // MANAGER / UPGRADE OVERLAY MODES
  // const overlayButton = new Container();
  const managerOverlayButton = new Container();
  const upgradeOverlayButton = new Container();
  const managerBG = Sprite.from('widgetManagerBtn');
  const upgradeBG = Sprite.from('widgetUpgradeBtn');
  // const inactiveOverlayBG = Sprite.from('businessSpriteBG');
  const managerInactiveBG = Sprite.from('businessSpriteBG');
  const upgradeInactiveBG = Sprite.from('businessSpriteBG');

  const managerTitleText = new Text(
    'Hire Manager:\n' + businessInfoObject.name,
    {
      fontFamily: 'Offside',
      fontSize: 18,
      align: 'left',
    }
  );
  const upgradeTitleText = new Text('Upgrade:\n' + businessInfoObject.name, {
    fontFamily: 'Offside',
    fontSize: 18,
    align: 'left',
  });
  managerTitleText.anchor.set(0, MIDDLE_VAL);
  upgradeTitleText.anchor.set(0, MIDDLE_VAL);

  managerTitleText.x = upgradeTitleText.x = 120;
  managerTitleText.y = upgradeTitleText.y =
    widgetBackground.height * MIDDLE_VAL;

  const upgradePriceText = new Text(
    moneyFormatter(businessInfoObject.upgradeCost, true),
    {
      fontFamily: 'Offside',
      fontSize: 22,
      align: 'center',
    }
  );
  const managerPriceText = new Text(
    moneyFormatter(businessInfoObject.managerCost, true),
    {
      fontFamily: 'Offside',
      fontSize: 22,
      align: 'center',
    }
  );

  managerPriceText.anchor.set(MIDDLE_VAL);
  upgradePriceText.anchor.set(MIDDLE_VAL);
  managerPriceText.x = upgradePriceText.x = 58;
  managerPriceText.y = upgradePriceText.y =
    widgetBackground.height * MIDDLE_VAL;

  managerOverlayButton.addChild(managerInactiveBG);
  managerOverlayButton.addChild(managerBG);
  managerOverlayButton.addChild(managerTitleText);
  managerOverlayButton.addChild(managerPriceText);
  managerOverlayButton.on('click', () => manageHandler(businessIndex));
  managerOverlayButton.interactive = managerOverlayButton.buttonMode = false;

  upgradeOverlayButton.addChild(upgradeInactiveBG);
  upgradeOverlayButton.addChild(upgradeBG);
  upgradeOverlayButton.addChild(upgradeTitleText);
  upgradeOverlayButton.addChild(upgradePriceText);
  upgradeOverlayButton.on('click', () => upgradeHandler(businessIndex));
  upgradeOverlayButton.interactive = upgradeOverlayButton.buttonMode = false;
  widget.addChild(managerOverlayButton);
  managerOverlayButton.visible = false;

  widget.addChild(upgradeOverlayButton);
  upgradeOverlayButton.visible = false;

  widget.showOverlay = (walletAmount, overlayType, portfolioItem) => {
    earnButton.visible = false;
    buyButton.visible = false;
    if (overlayType === 'upgrade') {
      if (portfolioItem && portfolioItem.isUpgraded) {
        upgradeTitleText.text = 'Upgraded!';
        upgradeTitleText.style.fill = 0xeeeeee;
        upgradeInactiveBG.tint = 0x555555;
        upgradeInactiveBG.visible = true;
        upgradeBG.visible = false;
        upgradePriceText.visible = false;
        upgradeOverlayButton.interactive = upgradeOverlayButton.buttonMode = false;
      } else {
        upgradeTitleText.text =
          'Upgrade 3x Payout:\n' + businessInfoObject.name;
        upgradePriceText.text = moneyFormatter(
          businessInfoObject.upgradeCost,
          true
        );
        upgradePriceText.visible = true;
        upgradeTitleText.style.fill = 0x000000;

        const buttonIsActive =
          widget.isOwned && walletAmount >= businessInfoObject.upgradeCost;
        upgradeBG.visible = buttonIsActive;
        upgradeOverlayButton.interactive = upgradeOverlayButton.buttonMode = buttonIsActive;
        upgradeInactiveBG.tint = 0xffffff;
        upgradeInactiveBG.visible = !buttonIsActive;
      }
      managerOverlayButton.visible = false;
      upgradeOverlayButton.visible = true;
    } else if (overlayType === 'manager') {
      if (portfolioItem && portfolioItem.hasManager) {
        managerTitleText.text = 'Managed!';
        managerPriceText.visible = false;
        managerTitleText.style.fill = 0xeeeeee;
        managerBG.visible = upgradeBG.visible = false;
        managerInactiveBG.tint = 0x555555;
        managerInactiveBG.visible = true;
        managerOverlayButton.interactive = managerOverlayButton.buttonMode = false;
      } else {
        managerTitleText.text = 'Hire Manager:\n' + businessInfoObject.name;
        managerTitleText.style.fill = 0x000000;
        managerPriceText.text = moneyFormatter(
          businessInfoObject.managerCost,
          true
        );
        managerPriceText.visible = true;
        const buttonIsActive =
          widget.isOwned && walletAmount >= businessInfoObject.managerCost;
        managerBG.visible = buttonIsActive;
        managerOverlayButton.interactive = managerOverlayButton.buttonMode = buttonIsActive;
        managerInactiveBG.tint = 0xffffff;
        managerInactiveBG.visible = !buttonIsActive;
      }
      managerOverlayButton.visible = true;
      upgradeOverlayButton.visible = false;
    }
  };

  widget.hideOverlay = () => {
    earnButton.visible = true;
    buyButton.visible = true;
    managerOverlayButton.visible = false;
    upgradeOverlayButton.visible = false;
  };

  // END MANAGER / UPGRADE OVERLAY MODES

  widget.refreshState = (walletAmount, portfolioItem) => {
    buyButton.activate(walletAmount >= businessInfoObject.cost);
    if (portfolioItem) {
      earnButton.refreshEarnAmount(calculatePayout(portfolioItem));
      widget.hasManager = portfolioItem.hasManager;

      if (portfolioItem.branchCount > 1) {
        titleText.text = portfolioItem.name + ' x ' + portfolioItem.branchCount;
      }
    }
    if (portfolioItem && !widget.isOwned) {
      widget.isOwned = true;
      timerText.style.fill = GAME_COLORS.textOrange;
      earnButton.activate(true);
    }
  };

  return widget;
};

export default BusinessWidget;
