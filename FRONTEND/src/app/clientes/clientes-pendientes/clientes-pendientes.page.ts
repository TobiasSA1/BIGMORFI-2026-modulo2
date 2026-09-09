import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonText,
  ModalController,
  ToastController,
  IonButtons,
  IonBackButton,
} from '@ionic/angular';
import { ClientesService, ClientePendiente } from '../clientes.service';
import { ConfirmarClienteModalComponent } from '../confirmar-cliente-modal/confirmar-cliente-modal.component';

@Component({
  selector: 'app-clientes-pendientes',
  templateUrl: './clientes-pendientes.page.html',
  styleUrls: ['./clientes-pendientes.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonButtons,
    IonBackButton
  ],
})
export class ClientesPendientesPage implements OnInit {
  clientes: ClientePendiente[] = [];
  cargando = false;

  constructor(
    private readonly clientesService: ClientesService,
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  async cargar(event?: CustomEvent) {
    this.cargando = true;
    try {
      this.clientes = await firstValueFrom(this.clientesService.listarPendientes());
      console.log('clientes seteados:', this.clientes);
    } catch (error){
      console.error('error al cargar clientes:', error);
      await this.mostrarToast('No se pudo cargar el listado de clientes pendientes.', 'danger');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  }

  async abrirConfirmacion(cliente: ClientePendiente, accion: 'aprobar' | 'rechazar') {
    const modal = await this.modalController.create({
      component: ConfirmarClienteModalComponent,
      componentProps: { cliente, accion },
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data?.confirmado) {
      await this.ejecutarAccion(cliente, accion);
    }
  }

  private async ejecutarAccion(cliente: ClientePendiente, accion: 'aprobar' | 'rechazar') {
    try {
      if (accion === 'aprobar') {
        await firstValueFrom(this.clientesService.aprobar(cliente.id));
        await this.mostrarToast(`${cliente.nombre} ${cliente.apellido} fue aprobado.`, 'success');
      } else {
        await firstValueFrom(this.clientesService.rechazar(cliente.id));
        await this.mostrarToast(`${cliente.nombre} ${cliente.apellido} fue rechazado.`, 'medium');
      }
      this.clientes = this.clientes.filter((c) => c.id !== cliente.id);
      this.cdr.detectChanges();
    } catch (error: any) {
      await this.mostrarToast(error?.error?.message ?? 'Ocurrió un error al procesar la solicitud.', 'danger');
    }
  }

  private async mostrarToast(message: string, color: 'success' | 'danger' | 'medium') {
    const toast = await this.toastController.create({ message, color, duration: 2500 });
    await toast.present();
  }
}