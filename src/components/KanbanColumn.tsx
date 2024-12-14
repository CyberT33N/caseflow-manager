import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Case } from './KanbanBoard';

interface KanbanColumnProps {
  cases: Case[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ cases }) => {
  return (
    <>
      {cases.map((case_, index) => (
        <Draggable key={case_.id} draggableId={case_.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="kanban-card"
            >
              <h3 className="font-medium mb-2">{case_.title}</h3>
              <p className="text-sm text-gray-500">Updated {case_.updatedAt}</p>
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};

export default KanbanColumn;