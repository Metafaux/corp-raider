import { Container, Text, Sprite } from 'pixi.js';
import { MIDDLE_VAL } from './const';
import { moneyFormatter } from './util';

const EarnButton = (earnAmount, businessIndex, timerStartHandler, isOwned) => {
  const button = new Container();
  const buttonShapeDisabled = Sprite.from('earnButtonDisabled');
  const buttonShape = Sprite.from('earnButtonEnabled');
  button.earnAmount = earnAmount;

  const buttonTextContent = 'EARN:\n' + moneyFormatter(earnAmount, true);
  const buttonText = new Text(buttonTextContent, {
    fontFamily: 'Offside',
    fontSize: 14,
    align: 'center',
  });

  button.enabled = true;

  buttonText.anchor.set(MIDDLE_VAL, MIDDLE_VAL);

  buttonText.x = 42;
  buttonText.y = buttonShape.height * MIDDLE_VAL;

  button.addChild(buttonShapeDisabled);
  button.addChild(buttonShape);
  button.addChild(buttonText);

  button.interactive = button.buttonMode = isOwned;
  buttonShape.visible = isOwned;

  button.refreshEarnAmount = (newEarnAmount) => {
    button.earnAmount = newEarnAmount;
    buttonText.text = 'EARN:\n' + moneyFormatter(newEarnAmount, true);
  };

  button.activate = (isActivated) => {
    button.interactive = button.buttonMode = isActivated;
    buttonShape.visible = isActivated;
  };

  button.on('click', () => {
    timerStartHandler(button.activate);
    button.activate(false);
  });

  return button;
};

export default EarnButton;
