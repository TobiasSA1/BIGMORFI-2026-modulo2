interface TemplateProps {
  nombre: string;
  logoUrl: string;
  restaurant: string;
}

export function plantillaRechazo({ nombre, logoUrl, restaurant }: TemplateProps): string {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background-color:#f7f2f2; font-family:Verdana, Geneva, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f2f2; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
              <tr>
                <td style="background-color:#8a2c2c; padding:24px; text-align:center;">
                  <img src="${logoUrl}" alt="${restaurant}" width="72" style="display:block; margin:0 auto 8px auto; border-radius:8px;" />
                  <span style="color:#ffffff; font-size:14px; letter-spacing:1px; text-transform:uppercase;">${restaurant}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px;">
                  <h1 style="font-family:'Courier New', monospace; font-size:22px; color:#8a2c2c; margin:0 0 16px 0;">
                    Hola, ${nombre}
                  </h1>
                  <p style="font-size:15px; line-height:1.6; color:#333333; margin:0 0 16px 0;">
                    Te escribimos para contarte que, luego de revisar tu solicitud de registro en
                    <strong>${restaurant}</strong>, no pudimos aprobarla en esta oportunidad.
                  </p>
                  <p style="font-size:15px; line-height:1.6; color:#333333; margin:0 0 24px 0;">
                    Si creés que se trata de un error, podés acercarte a nuestro local y hablar con el equipo.
                  </p>
                  <div style="text-align:center; margin:24px 0;">
                    <span style="display:inline-block; background-color:#8a2c2c; color:#ffffff; font-size:14px; font-weight:bold; padding:10px 24px; border-radius:6px;">
                      Registro no aprobado
                    </span>
                  </div>
                  <p style="font-size:12px; line-height:1.5; color:#999999; margin-top:32px;">
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