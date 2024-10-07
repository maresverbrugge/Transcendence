import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationGateway } from './communication.gateway';

describe('CommunicationGateway', () => {
  let gateway: CommunicationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunicationGateway],
    }).compile();

    gateway = module.get<CommunicationGateway>(CommunicationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
