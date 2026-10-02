import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonFooter, IonIcon } from '@ionic/angular';
import { HeaderMarcaComponent } from '../../core/components/header-marca/header-marca.component';

interface MensajeChat {
  autor: 'mozo' | 'cliente';
  texto: string;
  hora: string;
}

/**
 * ============================================================
 *  MOCKUP VISUAL — Módulo 3 (Nahue). SIN funcionalidad real todavía.
 * ============================================================
 *
 * PUNTO 11 — Chat en tiempo real con el mozo. La conversación de acá es
 * ejemplo hardcodeado; en real esto se conecta a la tabla `consultas`
 * (ver `modulo3_definitivo.sql`) con Supabase Realtime.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonFooter, IonIcon, HeaderMarcaComponent],
})
export class ChatPage {
  consultasRapidas = [
    '¿Podrías acercarte a la mesa?',
    '¿Cuánto falta para el pedido?',
    'Traer servilletas por favor',
  ];

  mensajes: MensajeChat[] = [
    { autor: 'mozo', texto: '¡Hola comensal! Cualquier consulta sobre la carta o tu pedido, avisame por acá.', hora: '20:30' },
    { autor: 'cliente', texto: '¡Hola mozo! ¿Me traés otra Coca por favor?', hora: '20:31' },
  ];

  mensajeNuevo = '';

  /** Estado visual: el ícono de enviar "despega" un instante al mandar. */
  despegando = false;

  enviarConAnimacion(texto?: string) {
    if ((texto ?? this.mensajeNuevo).trim()) {
      this.despegando = true;
      setTimeout(() => (this.despegando = false), 420);
    }
    this.enviar(texto);
  }

  enviar(texto?: string) {
    const contenido = (texto ?? this.mensajeNuevo).trim();
    if (!contenido) return;

    const ahora = new Date();
    this.mensajes.push({
      autor: 'cliente',
      texto: contenido,
      hora: `${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`,
    });
    this.mensajeNuevo = '';
  }
}
