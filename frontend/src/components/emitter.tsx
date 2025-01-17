import mitt from 'mitt';

type Events = {
  selectChannel: number;
  error: any;
  alert: string;
  acceptGameInvite: void;
  createChannel: void;
  showPasswordPrompt: number;
};

export const emitter = mitt<Events>();