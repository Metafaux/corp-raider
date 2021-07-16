import { Container, Text, Sprite } from 'pixi.js';
import { MIDDLE_VAL } from './const';
import { moneyFormatter } from './util';

const BuyButton = (costAmount, businessIndex, clickHandler) => {
  const button = new Container();
  const buttonShapeDisabled = Sprite.from('buyButtonDisabled');
  const buttonShape = Sprite.from('buyButtonEnabled');

  const buttonTextContent = 'BUY:\n' + moneyFormatter(costAmount, true);
  const buttonText = new Text(buttonTextContent, {
    fontFamily: 'Offside',
    fontSize: 14,
    align: 'center',
  });

  buttonText.anchor.set(MIDDLE_VAL, MIDDLE_VAL);

  buttonText.x = buttonShape.width * MIDDLE_VAL;
  buttonText.y = buttonShape.height * MIDDLE_VAL;

  button.addChild(buttonShapeDisabled);
  button.addChild(buttonShape);
  button.addChild(buttonText);

  // Set initial state
  button.interactive = button.buttonMode = false;
  buttonShape.visible = false;

  button.activate = (isActivated) => {
    button.interactive = button.buttonMode = isActivated;
    buttonShape.visible = isActivated;
  };

  button.on('click', () => {
    clickHandler(businessIndex);
  });

  return button;
};

export default BuyButton;
