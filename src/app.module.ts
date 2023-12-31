import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

import { UserModule } from '@app/modules/user/user.module';
import { AuthModule } from '@app/modules/auth/auth.module';
import { CustomExceptionFilter } from '@app/filters/global-exception.filter';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AdminModule } from '@app/modules/admin/admin.module';
import { PostgresPrismaService } from '@app/database/postgres-prisma.service';
import { PostgresQueriesService } from '@app/database/postgresQueries/userQueries.service';
import { DatabaseModule } from '@app/database/database.module';
import { ProductModule } from '@app/modules/product/products.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AdminModule,
    ProductModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    CustomExceptionFilter,
    PostgresQueriesService,
    PostgresPrismaService,
  ],
})
export class AppModule {}
