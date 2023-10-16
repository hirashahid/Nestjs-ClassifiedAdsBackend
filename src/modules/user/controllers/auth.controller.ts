import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { UserAuthService } from '@app/modules/user/services/auth.service';
import { User } from '@app/decorators/user.decorator';
import { JwtAuthGuard } from '@app/modules/auth/guards/auth.guard';
import { UserUpdateDto } from '@app/modules/user/dto/updateUser.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  updateProfileResponse,
  userProfileResponse,
} from '@app/swagger-docs/user-docs';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Get('/profile')
  @ApiOkResponse(userProfileResponse)
  async getProfile(@User() user: any) {
    return await this.userAuthService.getProfile(user);
  }

  @Patch('/profile')
  @ApiOkResponse(updateProfileResponse)
  async updateUserPassword(
    @Body() updateProfileDTO: UserUpdateDto,
    @User() user: any,
  ) {
    return await this.userAuthService.updateUser(updateProfileDTO, user);
  }
}
