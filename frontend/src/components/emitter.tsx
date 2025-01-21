import mitt from 'mitt';

type Events = {
  selectChannel: number;
  error: any;
  alert: string;
  acceptGameInvite: void;
  createChannel: void;
  showPasswordPrompt: number;
  confirm: { message: string; onOK: () => void };
};

export const emitter = mitt<Events>();