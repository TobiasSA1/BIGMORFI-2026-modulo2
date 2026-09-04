import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert({
              projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
              clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
              privateKey: this.config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
            }),
          });
  }

  getMessaging(): Messaging {
    return getMessaging(this.app);
  }
}