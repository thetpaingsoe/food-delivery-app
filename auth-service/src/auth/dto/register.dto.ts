import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, {
    message: 'password must contain at least 1 uppercase letter',
  })
  @Matches(/[0-9]/, { message: 'password must contain at least 1 number' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'password must contain at least 1 special character',
  })
  password!: string;
}
