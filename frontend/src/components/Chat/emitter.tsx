import mitt from 'mitt';

type Events = {
  selectChannel: number;
  error: any;
  alert: string;
};

export const emitter = mitt<Events>();