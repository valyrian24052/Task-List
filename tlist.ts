// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useRef, useEffect } from "react";
interface Task {
  id: string;
  content: string;
  column: string;
  color: string;
}
const App: React.FC = () => {
  const [newTask, setNewTask] = useState("");
  const pastelColors = [
    "bg-[#FFB5E8]", // Pink
    "bg-[#AFF8DB]", // Mint
    "bg-[#B28DFF]", // Purple
    "bg-[#BFFCC6]", // Light green
    "bg-[#FFC9DE]", // Rose
    "bg-[#C4FAF8]", // Turquoise
    "bg-[#FFABAB]", // Coral
    "bg-[#85E3FF]", // Sky blue
    "bg-[#F3FFE3]", // Light yellow
    "bg-[#FFE5CC]", // Peach
  ];
  const getRandomPastelColor = () => {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  };
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      content: "Complete project documentation",
      column: "todo",
      color: getRandomPastelColor(),
    },
    {
      id: "2",
      content: "Review team pull requests",
      column: "inProgress",
      color: getRandomPastelColor(),
    },
    {
      id: "3",
      content: "Set up weekly team meeting",
      column: "todo",
      color: getRandomPastelColor(),
    },
    {
      id: "4",
      content: "Research new technologies",
      column: "completed",
      color: getRandomPastelColor(),
    },
    {
      id: "5",
      content: "Fix navigation bug",
      column: "inProgress",
      color: getRandomPastelColor(),
    },
    {
      id: "6",
      content: "Update user dashboard",
      column: "completed",
      color: getRandomPastelColor(),
    },
    {
      id: "7",
      content: "Implement dark mode",
      column: "completed",
      color: getRandomPastelColor(),
    },
    {
      id: "8",
      content: "Optimize loading speed",
      column: "todo",
      color: getRandomPastelColor(),
    },
    {
      id: "9",
      content: "Create onboarding flow",
      column: "inProgress",
      color: getRandomPastelColor(),
    },
  ]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [isDraggingOverBin, setIsDraggingOverBin] = useState(false);
  const dragItem = useRef<any>(null);
  const dragNode = useRef<any>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragItem.current = taskId;
    dragNode.current = e.target;
    dragNode.current.addEventListener("dragend", handleDragEnd);
    setTimeout(() => {
      setDragging(taskId);
    }, 0);
  };
  const handleDragEnd = () => {
    setDragging(null);
    setIsDraggingOverBin(false);
    dragNode.current?.removeEventListener("dragend", handleDragEnd);
    dragItem.current = null;
    dragNode.current = null;
  };
  const handleDragEnter = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (dragging) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === dragging ? { ...task, column: targetColumn } : task,
        ),
      );
    }
  };
  const handleDragOverBin = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverBin(true);
  };
  const handleDragLeaveBin = () => {
    setIsDraggingOverBin(false);
  };
  const handleDropOnBin = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging) {
      setTasks((prev) => prev.filter((task) => task.id !== dragging));
      setIsDraggingOverBin(false);
    }
  };
  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: Date.now().toString(),
        content: newTask.trim(),
        column: "todo",
        color: getRandomPastelColor(),
      };
      setTasks((prev) => [...prev, newTaskItem]);
      setNewTask("");
    }
  };
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (binRef.current && dragItem.current) {
        const binRect = binRef.current.getBoundingClientRect();
        const { clientX, clientY } = e;
        if (
          clientX >= binRect.left &&
          clientX <= binRect.right &&
          clientY >= binRect.top &&
          clientY <= binRect.bottom
        ) {
          setIsDraggingOverBin(true);
        } else {
          setIsDraggingOverBin(false);
        }
      }
    };
    window.addEventListener("dragover", handleDragOver);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
    };
  }, []);
  const getTasksByColumn = (column: string) => {
    return tasks.filter((task) => task.column === column);
  };
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Task List</h1>
        <div className="mt-4 flex justify-center items-center gap-2 px-4">
          <input
            type="text"
            placeholder="Add new task..."
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#85E3FF] text-white placeholder-gray-400 focus:outline-none focus:border-[#B28DFF] w-full max-w-md"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          />
          <button
            onClick={handleAddTask}
            className="!rounded-button bg-[#85E3FF] bg-opacity-40 hover:bg-opacity-60 text-white px-4 py-2 transition-all duration-200 flex items-center justify-center whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Task
          </button>
        </div>
      </header>
      <main className="flex-grow flex flex-col md:flex-row px-4 gap-4 pb-20">
        <div
          className="flex-1 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "completed")}
        >
          <div className="bg-[#BFFCC6] bg-opacity-20 rounded-t-lg p-3 text-center">
            <h2 className="text-xl font-semibold text-[#E3FFE8]">Completed</h2>
          </div>
          <div className="bg-[#BFFCC6] bg-opacity-10 rounded-b-lg p-3 flex-grow">
            {getTasksByColumn("completed").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-3 mb-2 cursor-pointer shadow-md transition-all duration-200 ${task.color} bg-opacity-20 hover:bg-opacity-30 ${dragging === task.id ? "opacity-50" : "opacity-100"}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                {task.content}
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex-1 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "inProgress")}
        >
          <div className="bg-[#FFE5CC] bg-opacity-20 rounded-t-lg p-3 text-center">
            <h2 className="text-xl font-semibold text-[#FFF2E6]">
              In Progress
            </h2>
          </div>
          <div className="bg-[#FFE5CC] bg-opacity-10 rounded-b-lg p-3 flex-grow">
            {getTasksByColumn("inProgress").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-3 mb-2 cursor-pointer shadow-md transition-all duration-200 ${task.color} bg-opacity-20 hover:bg-opacity-30 ${dragging === task.id ? "opacity-50" : "opacity-100"}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                {task.content}
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex-1 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "todo")}
        >
          <div className="bg-[#B28DFF] bg-opacity-20 rounded-t-lg p-3 text-center">
            <h2 className="text-xl font-semibold text-[#E9DEFF]">To Do</h2>
          </div>
          <div className="bg-[#B28DFF] bg-opacity-10 rounded-b-lg p-3 flex-grow">
            {getTasksByColumn("todo").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-3 mb-2 cursor-pointer shadow-md transition-all duration-200 ${task.color} bg-opacity-20 hover:bg-opacity-30 ${dragging === task.id ? "opacity-50" : "opacity-100"}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                {task.content}
              </div>
            ))}
          </div>
        </div>
      </main>
      <div
        ref={binRef}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isDraggingOverBin ? "bg-red-600 scale-110" : "bg-[#85E3FF] bg-opacity-40"}`}
        onDragOver={handleDragOverBin}
        onDragLeave={handleDragLeaveBin}
        onDrop={handleDropOnBin}
      >
        <i
          className={`fas fa-trash-alt text-xl ${isDraggingOverBin ? "text-white" : "text-blue-200"}`}
        ></i>
      </div>
    </div>
  );
};
export default App;
