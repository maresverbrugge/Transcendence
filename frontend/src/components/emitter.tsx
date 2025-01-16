import mitt from 'mitt';

type Events = {
  selectChannel: number;
  error: any;
  alert: string;
  acceptGameInvite: void;
  createChannel: void;
};

export const emitter = mitt<Events>();