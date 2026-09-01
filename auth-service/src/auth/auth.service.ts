import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DbService } from '../db/db.service';
import { users } from '../db/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let created;
    try {
      [created] = await this.dbService.db
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email,
          passwordHash,
        })
        .returning();
    } catch (error) {
      this.logger.error('Failed to persist user', error as Error);
      throw new BadGatewayException('Could not create the account');
    }

    const token = this.signToken(created.id, created.email);

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      token,
    };
  }

  async login(dto: LoginDto) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user.id, user.email);

    this.logger.log('Logged In', user.name);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private signToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          '7d',
        ) as any,
      },
    );
  }
}
