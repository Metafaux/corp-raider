import { Container, Text, Sprite } from 'pixi.js';
import { MIDDLE_VAL } from './const';

const MenuButton = (text, clickHandler) => {
  const button = new Container();
  const buttonShape = Sprite.from('menuButton');

  const buttonText = new Text(text, {
    fontFamily: 'Offside',
    fontSize: 16,
    align: 'center',
  });

  buttonText.anchor.set(MIDDLE_VAL, MIDDLE_VAL);

  button.addChild(buttonShape);
  button.addChild(buttonText);

  buttonText.x = buttonShape.width * MIDDLE_VAL;
  buttonText.y = buttonShape.height * MIDDLE_VAL;

  button.interactive = button.buttonMode = true;
  button.on('click', () => {
    clickHandler();
  });
  return button;
};

export default MenuButton;
