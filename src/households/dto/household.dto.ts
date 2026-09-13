import { IsEmail } from 'class-validator';

export class InviteHouseholdMemberDto {
  @IsEmail()
  email: string;
}
