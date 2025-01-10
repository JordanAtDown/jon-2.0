import * as E from 'fp-ts/Either';

/**
 * Vérifie qu'un Either est un succès (`Right`) et exécute une validation sur le résultat.
 * @param either - Le Either à vérifier.
 * @param validate - Une fonction de validation qui reçoit la valeur (Right) et exécute les assertions.
 */
export const expectRight = <L, A>(
  either: E.Either<L, A>,
  validate: (result: A) => void,
): void => {
  if (E.isRight(either)) {
    validate(either.right); // Exécute la validation sur la valeur du succès
  } else {
    throw new Error(
      `Expected Right but got Left with: ${JSON.stringify(either.left)}`,
    );
  }
};

/**
 * Vérifie qu'un Either est un échec (`Left`) et exécute une validation sur l'erreur.
 * @param either - Le Either à vérifier.
 * @param validate - Une fonction de validation qui reçoit l'erreur (Left) et exécute les assertions.
 */
export const expectLeft = <L, A>(
  either: E.Either<L, A>,
  validate: (error: L) => void,
): void => {
  if (E.isLeft(either)) {
    validate(either.left); // Exécute la validation sur l'erreur
  } else {
    throw new Error(
      `Expected Left but got Right with: ${JSON.stringify(either.right)}`,
    );
  }
};
