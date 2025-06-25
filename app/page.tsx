"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

// Define the Task interface for type safety
interface Task {
  id: string
  content: string
  column: string
  color: string
  priority: "H" | "M" | "L" // Added priority property
}

export default function TaskBoard() {
  // State for the new task input field
  const [newTask, setNewTask] = useState("")
  // State for the priority of the new task, defaulting to 'H' (High)
  const [newTaskPriority, setNewTaskPriority] = useState<"H" | "M" | "L">("H")
  // State to track if we've loaded tasks from localStorage
  const [isLoaded, setIsLoaded] = useState(false)

  // Array of darker, muted pastel colors for task cards, chosen to match the image's aesthetic
  const pastelColors = [
    "bg-[#6b4c5c]", // Darker Pink
    "bg-[#4c6b5c]", // Darker Mint
    "bg-[#5c4c6b]", // Darker Purple
    "bg-[#4c6b4c]", // Darker Light Green
    "bg-[#6b5c4c]", // Darker Rose/Brown
    "bg-[#4c6b6b]", // Darker Turquoise
    "bg-[#6b4c4c]", // Darker Coral
    "bg-[#4c5c6b]", // Darker Sky Blue
    "bg-[#5c6b4c]", // Darker Light Yellow/Lime
    "bg-[#6b5c4c]", // Darker Peach/Orange
  ]

  // Function to get a random pastel color from the defined array
  const getRandomPastelColor = () => {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)]
  }

  // Define colors for priority levels (lighter pastel shades)
  const priorityColors = {
    H: "bg-red-400", // Softer red
    M: "bg-orange-300", // Softer orange
    L: "bg-green-400", // Softer green
  }

  // Default tasks for initial setup
  const getDefaultTasks = (): Task[] => [
    {
      id: "1",
      content: "Complete project documentation",
      column: "todo",
      color: getRandomPastelColor(),
      priority: "H",
    },
    {
      id: "2",
      content: "Review team pull requests",
      column: "inProgress",
      color: getRandomPastelColor(),
      priority: "M",
    },
    {
      id: "3",
      content: "Set up weekly team meeting",
      column: "todo",
      color: getRandomPastelColor(),
      priority: "L",
    },
    {
      id: "4",
      content: "Research new technologies",
      column: "completed",
      color: getRandomPastelColor(),
      priority: "H",
    },
    {
      id: "5",
      content: "Fix navigation bug",
      column: "inProgress",
      color: getRandomPastelColor(),
      priority: "M",
    },
    {
      id: "6",
      content: "Update user dashboard",
      column: "completed",
      color: getRandomPastelColor(),
      priority: "L",
    },
    {
      id: "7",
      content: "Implement dark mode",
      column: "completed",
      color: getRandomPastelColor(),
      priority: "H",
    },
    {
      id: "8",
      content: "Optimize loading speed",
      column: "todo",
      color: getRandomPastelColor(),
      priority: "M",
    },
    {
      id: "9",
      content: "Create onboarding flow",
      column: "inProgress",
      color: getRandomPastelColor(),
      priority: "L",
    },
  ]

  // Initial state for tasks - will be populated from localStorage or defaults
  const [tasks, setTasks] = useState<Task[]>([])

  // State to track the ID of the task currently being dragged
  const [dragging, setDragging] = useState<string | null>(null)
  // State to track if a task is being dragged over the trash bin
  const [isDraggingOverBin, setIsDraggingOverBin] = useState(false)

  // Refs for managing drag-and-drop elements
  const dragItem = useRef<string | null>(null) // Stores the ID of the dragged item
  const dragNode = useRef<EventTarget | null>(null) // Stores the DOM node of the dragged item
  const binRef = useRef<HTMLDivElement>(null) // Ref for the trash bin element

  // LocalStorage key for tasks
  const TASKS_STORAGE_KEY = "taskboard-tasks"

  /**
   * Load tasks from localStorage
   */
  const loadTasksFromStorage = (): Task[] => {
    try {
      if (typeof window !== "undefined") {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY)
        if (storedTasks) {
          return JSON.parse(storedTasks)
        }
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error)
    }
    return getDefaultTasks()
  }

  /**
   * Save tasks to localStorage
   */
  const saveTasksToStorage = (tasksToSave: Task[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave))
      }
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error)
    }
  }

  /**
   * Load tasks from localStorage on component mount
   */
  useEffect(() => {
    const loadedTasks = loadTasksFromStorage()
    setTasks(loadedTasks)
    setIsLoaded(true)
  }, [])

  /**
   * Save tasks to localStorage whenever tasks change (but not on initial load)
   */
  useEffect(() => {
    if (isLoaded) {
      saveTasksToStorage(tasks)
    }
  }, [tasks, isLoaded])

  /**
   * Handles the start of a drag operation.
   * @param e - The drag event.
   * @param taskId - The ID of the task being dragged.
   */
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragItem.current = taskId
    dragNode.current = e.target
    // Add an event listener to the dragged node to handle drag end
    dragNode.current?.addEventListener("dragend", handleDragEnd)
    // Set dragging state after a short delay to allow the drag image to form
    setTimeout(() => {
      setDragging(taskId)
    }, 0)
  }

  /**
   * Handles the end of a drag operation.
   */
  const handleDragEnd = () => {
    setDragging(null) // Reset dragging state
    setIsDraggingOverBin(false) // Reset bin hover state
    // Remove the dragend event listener
    dragNode.current?.removeEventListener("dragend", handleDragEnd)
    dragItem.current = null // Clear dragged item ID
    dragNode.current = null // Clear dragged node ref
  }

  /**
   * Handles a task being dragged over a column.
   * @param e - The drag event.
   * @param targetColumn - The column the task is being dragged into.
   */
  const handleDragEnter = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault() // Prevent default to allow drop
    if (dragging) {
      setTasks((prev) => prev.map((task) => (task.id === dragging ? { ...task, column: targetColumn } : task)))
    }
  }

  /**
   * Handles a task being dragged over the trash bin.
   * @param e - The drag event.
   */
  const handleDragOverBin = (e: React.DragEvent) => {
    e.preventDefault() // Prevent default to allow drop
    setIsDraggingOverBin(true) // Indicate that the bin is being hovered
  }

  /**
   * Handles a task leaving the trash bin area.
   */
  const handleDragLeaveBin = () => {
    setIsDraggingOverBin(false) // Reset bin hover state
  }

  /**
   * Handles a task being dropped onto the trash bin.
   * @param e - The drag event.
   */
  const handleDropOnBin = (e: React.DragEvent) => {
    e.preventDefault() // Prevent default behavior
    if (dragging) {
      setTasks((prev) => prev.filter((task) => task.id !== dragging)) // Remove the task
      setIsDraggingOverBin(false) // Reset bin hover state
    }
  }

  /**
   * Sorts tasks within a specific column alphabetically by content.
   * This function ensures that only tasks within the specified column are sorted,
   * while maintaining the relative order of tasks in other columns.
   * @param column - The column to sort.
   */
  const handleSort = (column: string) => {
    setTasks((prevTasks) => {
      // Create a mutable copy of the entire tasks array to work with
      const tasksCopy = [...prevTasks]

      // Filter out tasks that belong to the specified column
      const tasksToSort = tasksCopy.filter((task) => task.column === column)

      // Sort these filtered tasks alphabetically by their content
      tasksToSort.sort((a, b) => a.content.localeCompare(b.content))

      // Create a new array to hold the final sorted tasks
      const result: Task[] = []
      // Create an iterator for the sorted tasks in the target column
      const sortedColumnTasksIterator = tasksToSort[Symbol.iterator]()

      // Iterate through the original tasks array to reconstruct the new array
      for (const task of tasksCopy) {
        if (task.column === column) {
          // If the current task is in the column being sorted,
          // push the next task from the sorted list of column tasks
          result.push(sortedColumnTasksIterator.next().value)
        } else {
          // Otherwise, push the task as it is (maintaining its original position)
          result.push(task)
        }
      }
      return result // Return the new, sorted tasks array to update the state
    })
  }

  /**
   * Sorts tasks within a specific column by priority (High, Medium, Low).
   * @param column - The column to sort.
   */
  const handleSortByPriority = (column: string) => {
    setTasks((prevTasks) => {
      const tasksCopy = [...prevTasks]
      const tasksToSort = tasksCopy.filter((task) => task.column === column)

      // Define the priority order
      const priorityOrder = { H: 3, M: 2, L: 1 }

      // Sort tasks by priority in descending order (H, M, L)
      tasksToSort.sort((a, b) => {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      const result: Task[] = []
      const sortedColumnTasksIterator = tasksToSort[Symbol.iterator]()

      for (const task of tasksCopy) {
        if (task.column === column) {
          result.push(sortedColumnTasksIterator.next().value)
        } else {
          result.push(task)
        }
      }
      return result
    })
  }

  /**
   * Adds a new task to the "To Do" column.
   */
  const handleAddTask = () => {
    if (newTask.trim()) {
      // Ensure the input is not empty
      const newTaskItem: Task = {
        id: Date.now().toString(), // Unique ID for the new task
        content: newTask.trim(),
        column: "todo", // New tasks start in the "To Do" column
        color: getRandomPastelColor(), // Assign a random pastel color
        priority: newTaskPriority, // Assign the selected priority
      }
      setTasks((prev) => [...prev, newTaskItem]) // Add the new task to the state
      setNewTask("") // Clear the input field
      setNewTaskPriority("H") // Reset priority to default 'H'
    }
  }

  /**
   * Clears all tasks from all columns.
   */
  const handleClearAllTasks = () => {
    if (tasks.length > 0 && window.confirm("Are you sure you want to clear all tasks? This action cannot be undone.")) {
      setTasks([])
    }
  }

  /**
   * Reset tasks to default examples
   */
  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset to default tasks? This will replace all current tasks.")) {
      setTasks(getDefaultTasks())
    }
  }

  // Effect hook to handle global dragover event for the trash bin
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault() // Prevent default to allow drop
      if (binRef.current && dragItem.current) {
        const binRect = binRef.current.getBoundingClientRect() // Get bin's position
        const { clientX, clientY } = e // Get mouse coordinates

        // Check if the mouse is over the trash bin
        if (
          clientX >= binRect.left &&
          clientX <= binRect.right &&
          clientY >= binRect.top &&
          clientY <= binRect.bottom
        ) {
          setIsDraggingOverBin(true)
        } else {
          setIsDraggingOverBin(false)
        }
      }
    }

    // Add global dragover listener
    window.addEventListener("dragover", handleGlobalDragOver)

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver)
    }
  }, []) // Empty dependency array means this effect runs once on mount

  /**
   * Filters tasks based on their column.
   * @param column - The column to filter by.
   * @returns An array of tasks belonging to the specified column.
   */
  const getTasksByColumn = (column: string) => {
    return tasks.filter((task) => task.column === column)
  }

  // Show loading state until tasks are loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#85E3FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    // Main container with dark background and responsive flex layout
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Header section */}
      <header className="py-6 text-center">
        <h1 className="text-4xl font-bold text-[#e2e8f0] drop-shadow-lg">Task List</h1>
        <p className="text-sm text-gray-400 mt-2">
          <i className="fas fa-save mr-1"></i>
          Your tasks are automatically saved to your browser
        </p>
        {/* Input and Add Task button */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 px-4">
          <input
            type="text"
            placeholder="Add new task..."
            className="px-5 py-3 rounded-xl bg-[#1a1a1a] border border-[#3b3b3b] text-white placeholder-gray-500 focus:outline-none focus:border-[#85E3FF] w-full max-w-md shadow-inner"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          />
          {/* Priority selection as a slider-like button */}
          <div className="flex bg-[#1a1a1a] rounded-xl border border-[#3b3b3b] shadow-inner overflow-hidden">
            {["H", "M", "L"].map((priority) => (
              <button
                key={priority}
                onClick={() => setNewTaskPriority(priority as "H" | "M" | "L")}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200
                  ${newTaskPriority === priority ? "bg-[#85E3FF] text-black" : "text-gray-400 hover:bg-[#2a2a2a]"}
                  ${priority === "H" ? "rounded-l-xl" : ""}
                  ${priority === "L" ? "rounded-r-xl" : ""}
                  ${priority === "M" ? "border-l border-r border-[#3b3b3b]" : ""}
                `}
              >
                {priority}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddTask}
            className="bg-[#85E3FF] bg-opacity-30 hover:bg-opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Task
          </button>
          <button
            onClick={handleClearAllTasks}
            className="bg-red-600 bg-opacity-30 hover:bg-opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-trash-alt mr-2"></i>
            Clear All
          </button>
          <button
            onClick={handleResetToDefaults}
            className="bg-yellow-600 bg-opacity-30 hover:bg-opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-undo mr-2"></i>
            Reset
          </button>
        </div>
      </header>

      {/* Main content area with columns */}
      <main className="flex-grow flex flex-col md:flex-row px-4 md:px-8 gap-6 pb-24">
        {/* Completed Column */}
        <div
          className="flex-1 flex flex-col bg-[#1a3a3a] bg-opacity-30 rounded-2xl shadow-xl overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "completed")}
        >
          <div className="bg-[#1a3a3a] bg-opacity-80 rounded-t-2xl p-4 flex justify-between items-center border-b border-[#2a4a4a]">
            <h2 className="text-2xl font-semibold text-gray-200">Completed</h2>
            <div className="flex gap-2">
              {" "}
              {/* Container for sort buttons */}
              <button
                onClick={() => handleSort("completed")}
                className="bg-[#1a3a3a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks alphabetically"
              >
                <i className="fas fa-sort-alpha-down"></i>
              </button>
              <button
                onClick={() => handleSortByPriority("completed")}
                className="bg-[#1a3a3a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks by priority (High to Low)"
              >
                <i className="fas fa-sort-amount-down-alt"></i> P
              </button>
            </div>
          </div>
          <div className="p-4 flex-grow space-y-3 overflow-y-auto custom-scrollbar">
            {getTasksByColumn("completed").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-4 cursor-grab shadow-md transition-all duration-200 ${task.color} bg-opacity-60 hover:bg-opacity-80 text-gray-100 transform hover:scale-[1.02] active:cursor-grabbing opacity-${
                  dragging === task.id ? "40" : "100"
                } flex justify-between items-center`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <span>{task.content}</span>
                <span
                  className={`ml-4 px-2 py-1 text-xs font-bold rounded-md text-white ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div
          className="flex-1 flex flex-col bg-[#4a2a1a] bg-opacity-30 rounded-2xl shadow-xl overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "inProgress")}
        >
          <div className="bg-[#4a2a1a] bg-opacity-80 rounded-t-2xl p-4 flex justify-between items-center border-b border-[#5a3a2a]">
            <h2 className="text-2xl font-semibold text-gray-200">In Progress</h2>
            <div className="flex gap-2">
              {" "}
              {/* Container for sort buttons */}
              <button
                onClick={() => handleSort("inProgress")}
                className="bg-[#4a2a1a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks alphabetically"
              >
                <i className="fas fa-sort-alpha-down"></i>
              </button>
              <button
                onClick={() => handleSortByPriority("inProgress")}
                className="bg-[#4a2a1a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks by priority (High to Low)"
              >
                <i className="fas fa-sort-amount-down-alt"></i> P
              </button>
            </div>
          </div>
          <div className="p-4 flex-grow space-y-3 overflow-y-auto custom-scrollbar">
            {getTasksByColumn("inProgress").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-4 cursor-grab shadow-md transition-all duration-200 ${task.color} bg-opacity-60 hover:bg-opacity-80 text-gray-100 transform hover:scale-[1.02] active:cursor-grabbing opacity-${
                  dragging === task.id ? "40" : "100"
                } flex justify-between items-center`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <span>{task.content}</span>
                <span
                  className={`ml-4 px-2 py-1 text-xs font-bold rounded-md text-white ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* To Do Column */}
        <div
          className="flex-1 flex flex-col bg-[#3a1a4a] bg-opacity-30 rounded-2xl shadow-xl overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDragEnter(e, "todo")}
        >
          <div className="bg-[#3a1a4a] bg-opacity-80 rounded-t-2xl p-4 flex justify-between items-center border-b border-[#4a2a5a]">
            <h2 className="text-2xl font-semibold text-gray-200">To Do</h2>
            <div className="flex gap-2">
              {" "}
              {/* Container for sort buttons */}
              <button
                onClick={() => handleSort("todo")}
                className="bg-[#3a1a4a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks alphabetically"
              >
                <i className="fas fa-sort-alpha-down"></i>
              </button>
              <button
                onClick={() => handleSortByPriority("todo")}
                className="bg-[#3a1a4a] bg-opacity-50 hover:bg-opacity-70 text-gray-200 px-3 py-2 rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
                title="Sort tasks by priority (High to Low)"
              >
                <i className="fas fa-sort-amount-down-alt"></i> P
              </button>
            </div>
          </div>
          <div className="p-4 flex-grow space-y-3 overflow-y-auto custom-scrollbar">
            {getTasksByColumn("todo").map((task) => (
              <div
                key={task.id}
                className={`rounded-lg p-4 cursor-grab shadow-md transition-all duration-200 ${task.color} bg-opacity-60 hover:bg-opacity-80 text-gray-100 transform hover:scale-[1.02] active:cursor-grabbing opacity-${
                  dragging === task.id ? "40" : "100"
                } flex justify-between items-center`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <span>{task.content}</span>
                <span
                  className={`ml-4 px-2 py-1 text-xs font-bold rounded-md text-white ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Trash Bin */}
      <div
        ref={binRef}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
          isDraggingOverBin ? "bg-red-700 scale-125" : "bg-[#85E3FF] bg-opacity-20"
        }`}
        onDragOver={handleDragOverBin}
        onDragLeave={handleDragLeaveBin}
        onDrop={handleDropOnBin}
      >
        <i className={`fas fa-trash-alt text-2xl ${isDraggingOverBin ? "text-white" : "text-blue-300"}`}></i>
      </div>

      {/* Custom Scrollbar Styling (Tailwind doesn't directly support scrollbar styling, so using a custom class) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6a6a6a;
        }
      `}</style>
    </div>
  )
}
