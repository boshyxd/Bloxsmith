export interface SerializedInstance {
  className: string;
  name: string;
  properties: Record<string, unknown>;
  children: SerializedInstance[];
}

export interface PendingCommand {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt: number;
}

export interface CommandResponse {
  requestId: string;
  data?: unknown;
  error?: string;
}

