// Import der notwendigen React-Bibliothek
import React from 'react';
// Import der Drag & Drop Funktionalität von hello-pangea
import { Draggable } from '@hello-pangea/dnd';
// Import des Case-Typs aus der KanbanBoard Komponente
import type { Case } from './KanbanBoard';

// Definition der Props für die KanbanColumn Komponente
interface KanbanColumnProps {
  cases: Case[];  // Array von Cases, die in der Spalte angezeigt werden sollen
}

// KanbanColumn Komponente: Rendert die einzelnen Cases innerhalb einer Spalte
const KanbanColumn: React.FC<KanbanColumnProps> = ({ cases }) => {
  return (
    <>
      {/* Mapping über alle Cases und Erstellung von Draggable-Elementen */}
      {cases.map((case_, index) => (
        // Draggable-Wrapper für jeden Case mit eindeutiger ID und Index
        <Draggable key={case_.id} draggableId={case_.id} index={index}>
          {/* Render-Props Pattern für Drag & Drop Funktionalität */}
          {(provided) => (
            <div
              // Referenz und Props für Drag & Drop Funktionalität
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="kanban-card"
            >
              {/* Case Titel */}
              <h3 className="font-medium mb-2">{case_.title}</h3>
              {/* Zeitstempel der letzten Aktualisierung */}
              <p className="text-sm text-gray-500">Updated {case_.updatedAt}</p>
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};

export default KanbanColumn;