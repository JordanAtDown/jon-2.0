import React from 'react';
import { Text, Box, Spacer } from 'ink';

interface Checkpoint {
  id: string;
  source: string;
  category: string;
  totalProcessed: number;
}

interface Props {
  checkpoints: Checkpoint[];
}

const CheckpointList: React.FC<Props> = ({ checkpoints }) => {
  if (checkpoints.length === 0) {
    return <Text color="red">Aucun checkpoint trouvé.</Text>;
  }

  return (
    <Box flexDirection="column">
      {checkpoints.map((checkpoint, index) => (
        <Box
          key={index}
          flexDirection="column"
          borderStyle="round"
          borderColor="blue"
        >
          <Text>ID : {checkpoint.id}</Text>
          <Text>Source : {checkpoint.source}</Text>
          <Text>Catégorie : {checkpoint.category}</Text>
          <Text>Total traité : {checkpoint.totalProcessed}</Text>
          <Spacer />
        </Box>
      ))}
    </Box>
  );
};

export default CheckpointList;
