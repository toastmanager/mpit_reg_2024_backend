import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../storage/storage';

@Injectable()
export class MainPostersStorage extends StorageRepository {
  protected getBucketName(): string {
    return 'main-posters';
  }
}
