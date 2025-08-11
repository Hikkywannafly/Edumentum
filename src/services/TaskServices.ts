const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/student/tasks`;

interface CreateTaskDTO {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: Date;
}

interface UpdateTaskDTO extends CreateTaskDTO {
  id: string;
}

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export async function handleResponse(response: Response) {
  if (response.status === 403) {
    throw new AccessDeniedError(
      "Access denied. Please check your permissions.",
    );
  }
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
}

export async function getAllTasks(accessToken: string) {
  const response = await fetch(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return handleResponse(response);
}

export async function getTaskById(taskId: string, accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/${taskId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }
  return response.json();
}

export async function createTask(task: CreateTaskDTO, accessToken: string) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...task,
      status: task.status.toUpperCase(),
      dueDate: task.dueDate.toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  return response.json();
}

export async function updateTask(
  taskId: string,
  updates: Partial<UpdateTaskDTO>,
  accessToken: string,
) {
  const response = await fetch(`${API_BASE_URL}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...updates,
      status: updates.status?.toUpperCase(),
      dueDate: updates.dueDate?.toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to update task");
  }
  return response.json();
}

export async function deleteTask(taskId: string, accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
  return response.json();
}

// Batch operations for efficiency
export async function batchUpdateTasks(
  updates: { id: string; updates: Partial<UpdateTaskDTO> }[],
  accessToken: string,
) {
  const response = await fetch(`${API_BASE_URL}/batch`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      tasks: updates.map((item) => ({
        id: item.id,
        ...item.updates,
        status: item.updates.status?.toUpperCase(),
        dueDate: item.updates.dueDate?.toISOString(),
      })),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to batch update tasks");
  }
  return response.json();
}

export async function batchDeleteTasks(taskIds: string[], accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/batch`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ taskIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to batch delete tasks");
  }
  return response.json();
}

// Search and filter tasks - Fixed parameter order
export async function searchTasks(
  query: string,
  accessToken: string,
  filters: {
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dateFrom?: Date;
    dateTo?: Date;
  } = {},
) {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (filters.status) params.append("status", filters.status.toUpperCase());
  if (filters.dateFrom) {
    params.append("dateFrom", filters.dateFrom.toISOString());
  }
  if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to search tasks");
  }
  return response.json();
}

// Get task statistics
export async function getTaskStats(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch task statistics");
  }
  return response.json();
}
