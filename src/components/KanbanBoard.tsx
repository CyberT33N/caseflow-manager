// Import der notwendigen React-Hooks
import { useState } from 'react';
// Import der Drag & Drop Funktionalität von hello-pangea
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
// Import der Lucide Icons für die Benutzeroberfläche
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
// Import der UI-Komponenten aus der lokalen Komponenten-Bibliothek
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import KanbanColumn from './KanbanColumn';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from '@/components/theme-provider';

// Definition des Case-Typs für einzelne Karten
/**
 * Ein Case repräsentiert eine einzelne Karte auf dem Kanban-Board.
 * Es hat eine eindeutige ID, einen Titel und ein Update-Datum.
 */
export type Case = {
  id: string;
  title: string;
  updatedAt: string;
};

// Definition des Column-Typs für Spalten
/**
 * Eine Column repräsentiert eine Spalte auf dem Kanban-Board.
 * Sie hat eine eindeutige ID, einen Titel und eine Liste von Cases.
 */
export type Column = {
  id: string;
  title: string;
  cases: Case[];
};

// Hauptkomponente für das Kanban-Board
const KanbanBoard = () => {
  // Theme-Hook für Dark Mode Erkennung
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // State für die Kanban-Spalten mit Initial-Daten
  // Jede Spalte enthält eine ID, einen Titel und ein Array von Cases
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'TODO',
      cases: [
        { id: '1', title: 'Case 1', updatedAt: '3 days ago' },
        { id: '2', title: 'Case 2', updatedAt: '3 days ago' },
      ],
    },
    {
      id: 'in-progress',
      title: 'IN PROGRESS',
      cases: [
        { id: '3', title: 'Case 3', updatedAt: '3 days ago' },
      ],
    },
    {
      id: 'done',
      title: 'DONE',
      cases: [
        { id: '4', title: 'Case 4', updatedAt: '3 days ago' },
      ],
    },
    {
      id: 'archived',
      title: 'ARCHIVED',
      cases: [],
    },
  ]);

  // State für die Bearbeitung von Spaltentiteln
  // Speichert die ID der aktuell bearbeiteten Spalte oder null wenn keine bearbeitet wird
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  // Funktion zum Hinzufügen einer neuen Spalte
  // Generiert eine eindeutige ID und fügt eine leere Spalte am Ende hinzu
  const addNewColumn = () => {
    const id = crypto.randomUUID();
    setColumns((prev) => [...prev, { id, title: 'New Column', cases: [] }]);
    setEditingColumn(id); // Startet sofort die Bearbeitung des Titels
  };

  // Funktion zum Aktualisieren des Spaltentitels
  // Wird aufgerufen, wenn der Benutzer die Bearbeitung beendet
  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, title: newTitle || col.title } : col
      )
    );
    setEditingColumn(null); // Beendet den Bearbeitungsmodus
  };

  // Funktion zum Löschen einer Spalte
  // Entfernt die Spalte und zeigt eine Bestätigungsmeldung
  const deleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    toast.success('Column deleted successfully');
  };

  // Funktion zum Hinzufügen eines neuen Cases
  // Fügt einen neuen Case mit eindeutiger ID zur angegebenen Spalte hinzu
  const addNewCase = (columnId: string) => {
    const newCase: Case = {
      id: crypto.randomUUID(),
      title: 'New Case',
      updatedAt: 'Just now',
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cases: [...col.cases, newCase] }
          : col
      )
    );
  };

  // Handler für das Ende einer Drag & Drop Operation
  // Aktualisiert die Position des Cases in den Spalten
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Wenn keine Zielposition, abbrechen

    const { source, destination } = result;

    // Wenn Quelle und Ziel gleich sind, nichts tun
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Kopie des aktuellen Zustands erstellen
    const newColumns = [...columns];

    // Quell- und Zielspalte finden
    const sourceColumn = newColumns.find((col) => col.id === source.droppableId);
    const destColumn = newColumns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Case aus Quellspalte entfernen
    const [movedCase] = sourceColumn.cases.splice(source.index, 1);

    // Case in Zielspalte einfügen
    destColumn.cases.splice(destination.index, 0, movedCase);

    // State aktualisieren
    setColumns(newColumns);
  };

  return (
    // Hauptcontainer mit Dark Mode Support
    <div className="min-h-screen p-6 bg-background text-foreground flex flex-col">
      {/* Header mit Titel und Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Board</h1>
        <div className="flex gap-2 items-center">
          <ModeToggle />
          <Button onClick={addNewColumn} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
      
      {/* Drag & Drop Kontext für das gesamte Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map((column, index) => (
            <div key={column.id} className="kanban-column bg-card dark:bg-card/90 p-4 rounded-lg shadow-sm min-w-[350px]">
              {/* Spalten-Header mit Titel und Optionen */}
              <div className={`kanban-header mb-4 bg-background rounded p-4 ${isDarkMode ? 'gradient-border' : ''}`}>
                {editingColumn === column.id ? (
                  <Input
                    autoFocus
                    defaultValue={column.title}
                    className="dark:bg-background dark:text-foreground"
                    onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateColumnTitle(column.id, e.currentTarget.value);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-foreground dark:text-white">{column.title}</span>
                    {/* Dropdown-Menü für Spaltenaktionen */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingColumn(column.id)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteColumn(column.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Droppable Bereich für Cases */}
              {/* Definiert einen Bereich, in den Elemente per Drag & Drop platziert werden können */}
              {/* droppableId ist die eindeutige ID der Spalte für das Drag & Drop System */}
              <Droppable droppableId={column.id}>
                {/* Render-Props-Funktion, die von Droppable aufgerufen wird */}
                {/* provided enthält wichtige Properties für das Drag & Drop System */}
                {(provided) => (
                  <div
                    // Verbindet die DOM-Referenz mit dem Drag & Drop System
                    ref={provided.innerRef}
                    // Fügt alle notwendigen Props für das Dropping hinzu
                    {...provided.droppableProps}
                    // Garantiert eine Mindesthöhe, damit man auch in leere Spalten droppen kann
                    className="min-h-[200px]"
                  >
                    {/* Rendert die einzelnen Cases in der Spalte als Draggable Elemente */}
                    <KanbanColumn cases={column.cases} />
                    {/* Platzhalter der die Größe des gezogenen Elements annimmt */}
                    {/* Verhindert, dass die Spalte sich zusammenzieht während des Ziehens */}
                    {/* Sorgt für ein smoothes Layout ohne Sprünge während Drag & Drop */}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* "Create Case" Button wird nur in der ersten Spalte (TODO) angezeigt */}
              {/* index === 0 prüft, ob wir in der ersten Spalte sind */}
              {/* Der && Operator rendert den Button nur wenn die Bedingung true ist */}
              {index === 0 && (
                <Button 
                  // Ruft die addNewCase Funktion mit der aktuellen Spalten-ID auf
                  onClick={() => addNewCase(column.id)}
                  // Ghost Variant für einen subtilen Look
                  variant="ghost" 
                  // Volle Breite, Abstand nach oben und Hover-Effekt im Dark Mode
                  className="w-full mt-4 dark:hover:bg-muted"
                >
                  {/* Plus-Icon mit Abstand nach rechts */}
                  <Plus className="w-4 h-4 mr-2" />
                  Create Case
                </Button>
              )}
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;