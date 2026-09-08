import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, ModalController } from '@ionic/angular';
import { ClientePendiente } from '../clientes.service';

@Component({
  selector: 'app-confirmar-cliente-modal',
  templateUrl: './confirmar-cliente-modal.component.html',
  styleUrls: ['./confirmar-cliente-modal.component.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons],
})
export class ConfirmarClienteModalComponent {
  @Input() cliente!: ClientePendiente;
  @Input() accion!: 'aprobar' | 'rechazar';

  constructor(private readonly modalController: ModalController) {}

  cerrar(confirmado: boolean) {
    this.modalController.dismiss({ confirmado }, confirmado ? 'confirm' : 'cancel');
  }
}