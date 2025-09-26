export interface ClientEventData<T> {
  name: string;
  clientId: string;
  data: T;
}
