// import { Injectable } from '@nestjs/common';
// import { AbilityBuilder, PureAbility } from '@casl/ability';
// import { Superadmin } from '@prisma/client';
// import { createPrismaAbility, PrismaQuery } from '@casl/prisma';

// export enum Action {
//   Manage = 'manage',
//   Read = 'read',
//   Update = 'update',
//   Delete = 'delete',
// }

// export type AppAbility = PureAbility<[string, string], PrismaQuery>;

// @Injectable()
// export class CaslAbilityFactory {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   createForSuperadmin(_superadmin: Superadmin) {
//     const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

//     can(Action.Manage, 'all');

//     return build();
//   }
// }

// src/common/casl-ability.factory.ts
// import { Injectable } from '@nestjs/common';

// import { createPrismaAbility, PrismaAbility } from '@casl/prisma';
// import { Superadmin } from '@prisma/client';
// import { AbilityBuilder } from '@casl/ability';

// export enum Action {
//   Manage = 'manage',
//   Read = 'read',
//   Update = 'update',
//   Delete = 'delete',
// }

// // Ganti tipe AppAbility menggunakan PrismaAbility
// export type AppAbility = PrismaAbility<[Action, any]>; // Atau [Action, 'modelName']

// @Injectable()
// export class CaslAbilityFactory {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   createForSuperadmin(_superadmin: Superadmin): AppAbility {
//     const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
//     can(Action.Manage, 'all'); // Aturan akses SUPERADMIN
//     return build();
//   }
// }

import { Injectable } from '@nestjs/common';
import { createPrismaAbility, PrismaQuery } from '@casl/prisma';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Superadmin } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = PureAbility<[Action, any], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createForSuperadmin(_superadmin: Superadmin): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
    can(Action.Manage, 'all'); // Gunakan enum
    return build();
  }
}
