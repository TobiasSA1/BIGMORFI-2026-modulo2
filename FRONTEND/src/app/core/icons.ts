import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';
// Módulo 2 (Catálogo, Mesas y Sectores) - iconos para los estados vacíos de Cocina/Bar
import { restaurantOutline, wineOutline } from 'ionicons/icons';
// Mockups visuales de Módulo 3 y Módulo 4 (ver src/app/sala/ y src/app/cierre/)
import {
  chatbubbleOutline,
  send,
  star,
  starOutline,
  checkmarkCircle,
  ellipseOutline,
  closeCircle,
  timeOutline,
  cashOutline,
  checkmarkDoneOutline,
  happyOutline,
} from 'ionicons/icons';
// Retoque visual general: mostrar/ocultar contraseña, estados de cuenta y
// cámara/fotos en las altas.
import { eye, eyeOff, hourglassOutline, cameraOutline, qrCodeOutline, logOutOutline } from 'ionicons/icons';
// Navegación inferior del cliente y buscador de la carta.
import { receiptOutline, searchOutline, closeOutline, optionsOutline, add } from 'ionicons/icons';

export function registrarIconos() {
  addIcons({
    'person-circle-outline': personCircleOutline,
    'restaurant-outline': restaurantOutline,
    'wine-outline': wineOutline,
    'chatbubble-outline': chatbubbleOutline,
    send,
    star,
    'star-outline': starOutline,
    'checkmark-circle': checkmarkCircle,
    'ellipse-outline': ellipseOutline,
    'close-circle': closeCircle,
    'time-outline': timeOutline,
    'cash-outline': cashOutline,
    'checkmark-done-outline': checkmarkDoneOutline,
    'happy-outline': happyOutline,
    eye,
    'eye-off': eyeOff,
    'hourglass-outline': hourglassOutline,
    'camera-outline': cameraOutline,
    'qr-code-outline': qrCodeOutline,
    'log-out-outline': logOutOutline,
    'receipt-outline': receiptOutline,
    'search-outline': searchOutline,
    'close-outline': closeOutline,
    'options-outline': optionsOutline,
    add,
  });
}