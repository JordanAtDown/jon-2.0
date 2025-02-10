import blessed, { Widgets } from 'blessed';

export const statusProcessComponent = (
  screen: Widgets.Screen,
): Widgets.BoxElement => {
  return blessed.box({
    parent: screen,
    border: 'line',
    style: {
      fg: 'white',
      border: { fg: 'magenta' },
      align: 'center',
    },
    width: '100%',
    top: 6,
    height: 3,
    label: ' Status process ',
    content: 'Calcul en cours...',
  });
};
