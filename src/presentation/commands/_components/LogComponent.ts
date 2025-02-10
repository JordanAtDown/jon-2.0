import blessed, { Widgets } from 'blessed';

export const logComponent = (screen: Widgets.Screen): Widgets.Log => {
  return blessed.log({
    parent: screen,
    border: 'line',
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'green' },
    },
    width: '99%',
    height: '70%',
    top: 9,
    label: ' Logs ',
    tags: true,
    keys: true,
    mouse: true,
    vi: true,
    alwaysScroll: true,
    scrollable: true,
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'gray',
      },
      style: {
        fg: 'green',
        bg: 'blue',
      },
    },
    autoPadding: false,
  });
};
