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

const KanbanBoard = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // State für die Kanban-Spalten mit Initial-Daten
  /**
   * Der State für die Kanban-Spalten wird initialisiert mit vier Spalten:
   * TODO, IN PROGRESS, DONE und ARCHIVED.
   */
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

  // State für die aktuell bearbeitete Spalte
  /**
   * Der State für die aktuell bearbeitete Spalte wird initialisiert mit null.
   * Wenn eine Spalte bearbeitet wird, wird ihre ID hier gespeichert.
   */
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  // Handler für das Ende einer Drag & Drop Operation
  /**
   * Wenn eine Drag & Drop Operation beendet wird, wird dieser Handler aufgerufen.
   * Er aktualisiert die Position der Cases in den Spalten entsprechend.
   */
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Neuanordnung innerhalb derselben Spalte
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const newCases = Array.from(column.cases);
      const [removed] = newCases.splice(source.index, 1);
      newCases.splice(destination.index, 0, removed);

      setColumns(columns.map(col => 
        col.id === source.droppableId ? { ...col, cases: newCases } : col
      ));
    } else {
      // Verschieben zwischen verschiedenen Spalten
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceCases = Array.from(sourceColumn.cases);
      const destCases = Array.from(destColumn.cases);
      const [removed] = sourceCases.splice(source.index, 1);
      destCases.splice(destination.index, 0, removed);

      setColumns(columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, cases: sourceCases };
        }
        if (col.id === destination.droppableId) {
          return { ...col, cases: destCases };
        }
        return col;
      }));

      toast.success(`Case moved to ${destColumn.title}`);
    }
  };

  // Funktion zum Hinzufügen eines neuen Cases
  /**
   * Diese Funktion fügt ein neues Case zu einer Spalte hinzu.
   * Das neue Case erhält eine eindeutige ID, einen Titel und ein Update-Datum.
   */
  const addNewCase = (columnId: string) => {
    const newCase: Case = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Case ${Math.floor(Math.random() * 1000)}`,
      updatedAt: 'Just now',
    };

    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cases: [newCase, ...col.cases] }
        : col
    ));

    toast.success('New case created');
  };

  // Funktion zum Hinzufügen einer neuen Spalte
  /**
   * Diese Funktion fügt eine neue Spalte zum Kanban-Board hinzu.
   * Die neue Spalte erhält eine eindeutige ID, einen Titel und eine leere Liste von Cases.
   */
  const addNewColumn = () => {
    const newColumn: Column = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Column',
      cases: [],
    };

    setColumns([...columns, newColumn]);
    setEditingColumn(newColumn.id);
    toast.success('New column added');
  };

  // Funktion zum Löschen einer Spalte
  /**
   * Diese Funktion löscht eine Spalte vom Kanban-Board.
   * Alle Cases in der Spalte werden gelöscht.
   */
  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
    toast.success('Column deleted');
  };

  // Funktion zum Aktualisieren des Spaltentitels
  /**
   * Diese Funktion aktualisiert den Titel einer Spalte.
   * Der neue Titel wird im State gespeichert.
   */
  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
    setEditingColumn(null);
  };

  return (
    // Hauptcontainer mit Dark Mode Support
    <div className="p-6 bg-background text-foreground">
      <ModeToggle />

      {/* Header mit Titel und "Add Column" Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Board</h1>
        <Button onClick={addNewColumn} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
      </div>
      
      {/* Drag & Drop Kontext für das gesamte Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column, index) => (
            <div key={column.id} className="kanban-column bg-card dark:bg-card/90 p-4 rounded-lg shadow-sm min-w-[350px]">
              {/* Spalten-Header mit Titel und Optionen */}
              <div className={`kanban-header mb-4 bg-background rounded p-2 ${isDarkMode ? 'gradient-border' : ''}`}>
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
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    <KanbanColumn cases={column.cases} />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* "Create Case" Button nur in der ersten Spalte */}
              {index === 0 && (
                <Button 
                  onClick={() => addNewCase(column.id)}
                  variant="ghost" 
                  className="w-full mt-4 dark:hover:bg-muted"
                >
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