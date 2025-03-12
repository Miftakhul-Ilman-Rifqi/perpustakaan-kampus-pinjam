import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { Superadmin, Role } from '@prisma/client';

// Mendefinisikan tipe untuk subjek yang dapat diakses
export type AppSubjects = 'Superadmin' | 'Student' | 'Book' | 'Loan' | 'all';
export type AppAbility = MongoAbility<[string, AppSubjects | 'all']>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: Superadmin) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.role === Role.SUPERADMIN) {
      // Superadmin memiliki akses penuh ke semua resource
      can('manage', 'all');
    } else if (user.role === Role.OPERATOR) {
      can('update', 'Student');
      can('delete', 'Student');
      cannot('read', 'Student');

      // Tambahkan aturan lain untuk operator sesuai kebutuhan
    }

    return build();
  }
}
