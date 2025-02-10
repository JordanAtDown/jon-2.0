import blessed, { Widgets } from 'blessed';

export const statusETA = (screen: Widgets.Screen): Widgets.BoxElement => {
  return blessed.box({
    parent: screen,
    border: 'line',
    style: {
      fg: 'white',
      border: { fg: 'yellow' },
      align: 'center',
    },
    width: '100%',
    top: 3,
    height: 3,
    label: ' Temps Estimé (ETA) ',
    content: 'Calcul en cours...',
  });
};
