import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Patch} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) 
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const userId = req.user.id; 
    
    return this.authService.getAdminProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }

}