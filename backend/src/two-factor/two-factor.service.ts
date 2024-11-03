import { Injectable } from '@nestjs/common';

@Injectable()
export class TwoFactorService {
	async doStuff(something: string): Promise<any> {
		console.log('2FA service');
		console.log("something:", something);
	}
}
