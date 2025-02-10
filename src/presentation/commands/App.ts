import {
  createOnCallbacks,
  initializeTrackingView,
} from './_components/InitializeTrackingView.js';
import {
  ItemState,
  ItemTracker,
} from '../../domain/shared/tracker/ItemTracker.js';
import ProgressTracker from '../../domain/shared/tracker/ProgressTracker.js';
import { ItemTrackerBuilder } from '../../domain/shared/tracker/ItemTrackBuilder.js';
import WrapperMutableProgressTracker from '../../domain/shared/tracker/WrapperMutableProgressTracker.js';
import WrapperMutableItemTracker from '../../domain/shared/tracker/WrapperMutableItemTracker.js';

const App = () => {
  // Étape 1 : Initialiser la vue et les composants
  const {
    screen,
    progressBarComponent,
    statusETAComponent,
    log,
    statusProcess,
  } = initializeTrackingView();

  const { onItemTrackCallback, onProgressUpdateCallback } = createOnCallbacks(
    progressBarComponent,
    statusETAComponent,
    log,
    screen,
    statusProcess,
  );

  // Étape 2 : Initialiser les trackers
  // ItemTracker
  const itemTracker = new WrapperMutableItemTracker(
    ItemTracker.init(onItemTrackCallback),
  );

  // ProgressTracker
  const totalItems = 5; // Nombre total d'éléments à suivre
  const progressTracker = new WrapperMutableProgressTracker(
    ProgressTracker.init(totalItems, onProgressUpdateCallback),
  );

  // TODO: a ajouter quelque part
  // screen.key(['C-c', 'q'], () => {
  //   log.log('{yellow-fg}Press "ENTER" for confirm exit{/yellow-fg}');
  //   screen.key('enter', () => {
  //     log.log('{yellow-fg}Exit{/yellow-fg}');
  //     screen.destroy();
  //     process.exit(0);
  //   });
  // });

  // Étape 3 : Simuler le tracking avec un timer
  simulateTrackingWithTimer(itemTracker, progressTracker);
};

// Fonction pour créer des items dynamiquement
const createTestItems = () => {
  const itemBuilder = ItemTrackerBuilder.start();

  return [
    itemBuilder
      .withId('/a/gdfgdfgd/gdfgdf/jdfg.jd')
      .asNormalItem(ItemState.PROCESS),
    itemBuilder
      .withId('/f/gdfgdfgd/gdfgdf/jdfg.jd')
      .asErrorItem(
        "Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passag",
      )
      .build(),
    itemBuilder
      .withId('/e/gdfgdfgd/gdfgdf/jdfg.jd')
      .asNormalItem(ItemState.UNPROCESS),
    itemBuilder
      .withId(
        '/t/dfgdf/dfgdf/dfgdfg/dfgdfg/dgfdf/dfgdf/dfgdf/fdgdfgdfgd/gdfgdfgd/gdfgdf/jdfg.jd',
      )
      .asNormalItem(ItemState.PROCESS),
    itemBuilder
      .withId('/ag/gdfgdfgd/gdfgdf/jdfg.jd')
      .asNormalItem(ItemState.PROCESS),
  ];
};

// Fonction pour simuler et tester les trackers avec un timer
const simulateTrackingWithTimer = (
  itemTracker: WrapperMutableItemTracker,
  progressTracker: WrapperMutableProgressTracker,
) => {
  const items = createTestItems(); // Créer les items via le builder
  let index = 0; // Index pour suivre l'élément courant

  // Timer pour simuler le suivi des items
  const timer = setInterval(() => {
    const currentItem = items[index];

    if (currentItem) {
      // Vérifier si l'élément existe avant de poursuivre
      // Mettre à jour l'ItemTracker avec l'élément courant
      itemTracker.track(currentItem);

      // Incrémenter le ProgressTracker
      progressTracker.increment();

      index++; // Passer à l'élément suivant
    } else {
      // Lorsque tous les items sont traités ou si index est invalide, arrêter le timer
      clearInterval(timer);
    }
  }, 2000); // Ajout d'un nouvel élément toutes les 2 secondes
};

// Démarrer l'application
App();
