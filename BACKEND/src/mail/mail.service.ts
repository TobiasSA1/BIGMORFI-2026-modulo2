import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { plantillaAprobacion } from './templates/aprobacion.template';
import { plantillaRechazo } from './templates/rechazo.template';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logoUrl: string;
  private readonly restaurant: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.from = this.config.get<string>('MAIL_FROM')!;
    this.logoUrl = this.config.get<string>('LOGO_URL')!;
    this.restaurant = this.config.get<string>('RESTAURANT_NAME') ?? 'Nuestro Restaurante';
  }

  async enviarMailAprobacion(destinatario: string, nombre: string) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: "bigmorfi2026@gmail.com",
      subject: `¡Tu registro fue aprobado! - ${this.restaurant}`,
      html: plantillaAprobacion({ nombre, logoUrl: this.logoUrl, restaurant: this.restaurant }),
    });
    if (error) this.logger.error(`Error mandando mail de aprobación a ${destinatario}: ${error.message}`);
  }

  async enviarMailRechazo(destinatario: string, nombre: string) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: "bigmorfi2026@gmail.com",
      subject: `Novedades sobre tu registro - ${this.restaurant}`,
      html: plantillaRechazo({ nombre, logoUrl: this.logoUrl, restaurant: this.restaurant }),
    });
    if (error) this.logger.error(`Error mandando mail de rechazo a ${destinatario}: ${error.message}`);
  }
}