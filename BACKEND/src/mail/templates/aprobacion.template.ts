interface TemplateProps {
  nombre: string;
  logoUrl: string;
  restaurant: string;
}

export function plantillaAprobacion({ nombre, logoUrl, restaurant }: TemplateProps): string {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background-color:#f4f1ea; font-family:'Trebuchet MS', Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
              <tr>
                <td style="background-color:#1f6f4f; padding:24px; text-align:center;">
                  <img src="${logoUrl}" alt="${restaurant}" width="72" style="display:block; margin:0 auto 8px auto; border-radius:8px;" />
                  <span style="color:#ffffff; font-size:14px; letter-spacing:1px; text-transform:uppercase;">${restaurant}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px;">
                  <h1 style="font-family:Georgia, 'Times New Roman', serif; font-size:26px; color:#1f6f4f; margin:0 0 16px 0;">
                    ¡Bienvenido/a, ${nombre}!
                  </h1>
                  <p style="font-size:16px; line-height:1.6; color:#333333; margin:0 0 16px 0;">
                    Tenemos una excelente noticia: tu registro como cliente en <strong>${restaurant}</strong> fue
                    <span style="color:#1f6f4f; font-weight:bold;">aprobado</span>.
                  </p>
                  <p style="font-size:16px; line-height:1.6; color:#333333; margin:0 0 24px 0;">
                    Ya podés ingresar a la aplicación con tu correo y contraseña.
                  </p>
                  <div style="text-align:center; margin:24px 0;">
                    <span style="display:inline-block; background-color:#1f6f4f; color:#ffffff; font-size:15px; font-weight:bold; padding:12px 28px; border-radius:8px;">
                      Cuenta habilitada
                    </span>
                  </div>
                  <p style="font-size:13px; line-height:1.5; color:#888888; margin-top:32px;">
                    Este es un mensaje automático, por favor no respondas a este correo.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}