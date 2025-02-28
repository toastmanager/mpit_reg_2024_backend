import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../storage/storage';

@Injectable()
export class ExtraPostersStorage extends StorageRepository {
  protected getBucketName(): string {
    return 'extra-posters';
  }
}
