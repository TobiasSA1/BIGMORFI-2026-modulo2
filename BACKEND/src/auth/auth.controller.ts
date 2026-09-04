import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';


@Controller('auth')
export class AuthController {
    // constructor(private readonly authService: AuthService) {}

    // @Post('login')
    // login(@Body() loginDto: LoginDto) {
    //     return this.authService.login(
    //     loginDto.email,
    //     loginDto.password,
    //     );
    // }

    // @UseGuards(JwtAuthGuard)
    // @Get('perfil')
    // perfil(@Req() req: any) {
    //     return req.user;
    // }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('DUENO')
    // @Get('solo-dueno')
    // soloDueno(@Req() req: any) {
    // return {
    //     mensaje: 'Tenés acceso porque sos DUENO',
    //     usuario: req.user,
    // };
    // }
}

