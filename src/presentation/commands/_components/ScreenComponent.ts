import blessed, { Widgets } from 'blessed';

export const screenComponent = (): Widgets.Screen => {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Progression et Logs avec Blessed',
  });

  const showQuitConfirmation = () => {
    const quitBox = blessed.box({
      parent: screen,
      border: 'line',
      width: '50%',
      height: '30%',
      top: 'center',
      left: 'center',
      label: ' Confirmation ',
      tags: true,
      style: {
        fg: 'white',
        bg: 'blue',
        border: { fg: 'blue' },
      },
      content:
        'Êtes-vous sûr de vouloir quitter ?\n\n{green-fg}[Y]{/green-fg} Oui / {red-fg}[N]{/red-fg} Non',
    });

    quitBox.focus();

    screen.key(['y', 'Y'], () => {
      screen.destroy();
      process.exit(0);
    });

    screen.key(['n', 'N'], () => {
      quitBox.detach();
      screen.render();
    });

    screen.render();
  };

  screen.key(['q', 'C-c', 'escape'], () => {
    showQuitConfirmation();
  });

  return screen;
};
