export interface ClientEventData<T> {
  name: string;
  clientId: string;
  connected: boolean;
  data: T;
}
