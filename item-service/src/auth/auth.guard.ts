import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token format');
    }

    const token = authorization.slice(7);

    try {
      const response = await firstValueFrom(
        this.httpService.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      request.user = response.data;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
