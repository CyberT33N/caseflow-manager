import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

export type Case = {
  id: string;
  title: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  title: string;
  cases: Case[];
};

const KanbanBoard = () => {
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

  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const newCases = Array.from(column.cases);
      const [removed] = newCases.splice(source.index, 1);
      newCases.splice(destination.index, 0, removed);

      setColumns(columns.map(col => 
        col.id === source.droppableId ? { ...col, cases: newCases } : col
      ));
    } else {
      // Moving between columns
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

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
    toast.success('Column deleted');
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
    setEditingColumn(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Board</h1>
        <Button onClick={addNewColumn} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column, index) => (
            <div key={column.id} className="kanban-column">
              <div className="kanban-header mb-4">
                {editingColumn === column.id ? (
                  <Input
                    autoFocus
                    defaultValue={column.title}
                    onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateColumnTitle(column.id, e.currentTarget.value);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span>{column.title}</span>
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

              {index === 0 && (
                <Button 
                  onClick={() => addNewCase(column.id)}
                  variant="ghost" 
                  className="w-full mt-4"
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