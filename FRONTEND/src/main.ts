import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

import { registrarIconos } from './app/core/icons';
import { bmModalEntrada, bmModalSalida, bmTransicionPagina } from './app/core/motion/motion';

registrarIconos();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Transiciones de pantalla y de modales propias de la app (ver core/motion).
    provideIonicAngular({ navAnimation: bmTransicionPagina, modalEnter: bmModalEntrada, modalLeave: bmModalSalida }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
});
