import blessed, { Widgets } from 'blessed';

export const progressBar = (
  screen: Widgets.Screen,
): Widgets.ProgressBarElement => {
  return blessed.progressbar({
    parent: screen,
    border: 'line',
    style: {
      border: { fg: 'cyan' },
      bar: { bg: 'cyan' },
    },
    width: '100%',
    top: 0,
    height: 3,
    filled: 0,
    label: ' Progression ',
    content: '',
  });
};
