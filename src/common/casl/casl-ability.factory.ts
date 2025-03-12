import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { Superadmin, Role } from '@prisma/client';

// Mendefinisikan tipe untuk subjek yang dapat diakses
export type AppSubjects = 'Student' | 'Book' | 'Loan' | 'all';
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
      // Operator hanya bisa membaca daftar siswa, tapi tidak bisa mengakses detail siswa
      // Operator hanya bisa membaca (list dan search) tapi tidak bisa akses detail atau modifikasi
      can('read', 'Student');
      cannot('read_one', 'Student');
      cannot('manage', 'Student'); // Tidak boleh melakukan operasi "manage" yang lebih luas

      // Tambahkan aturan lain untuk operator sesuai kebutuhan
    }

    return build();
  }
}
