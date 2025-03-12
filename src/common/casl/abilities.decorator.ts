// src/common/casl/abilities.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { AppSubjects } from './casl-ability.factory';

export interface RequiredRule {
  action: string;
  subject: AppSubjects | 'all';
}

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata('abilities', requirements);

// Helper decorator untuk akses yang umum
export const CanRead = (subject: AppSubjects) =>
  CheckAbilities({ action: 'read', subject });

export const CanReadOne = (subject: AppSubjects) =>
  CheckAbilities({ action: 'read_one', subject });

export const CanCreate = (subject: AppSubjects) =>
  CheckAbilities({ action: 'create', subject });

export const CanUpdate = (subject: AppSubjects) =>
  CheckAbilities({ action: 'update', subject });

export const CanDelete = (subject: AppSubjects) =>
  CheckAbilities({ action: 'delete', subject });
