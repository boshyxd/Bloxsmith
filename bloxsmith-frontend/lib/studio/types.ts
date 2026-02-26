export interface SerializedInstance {
  className: string;
  name: string;
  properties: Record<string, unknown>;
  children: SerializedInstance[];
}

export interface SavedStyle {
  id: string;
  name: string;
  createdAt: number;
  sourceGame?: string;
  tree: SerializedInstance;
  tokens: DesignTokens;
}

export interface DesignTokens {
  colors: { value: string; count: number }[];
  fonts: { value: string; count: number }[];
  cornerRadii: number[];
  strokePatterns: { color: string; thickness: number }[];
  transparencyValues: number[];
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

export interface StudioSession {
  code: string;
  createdAt: number;
  lastPing: number;
  pending: PendingCommand[];
  responses: Map<string, CommandResponse>;
}
