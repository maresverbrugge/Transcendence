import mitt from 'mitt';

type Events = {
  selectChannel: number;
  error: any;
  alert: string;
  acceptGameInvite: void;
};

export const emitter = mitt<Events>();