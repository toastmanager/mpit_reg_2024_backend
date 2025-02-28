import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../storage/storage';

@Injectable()
export class PostersStorage extends StorageRepository {
  protected getBucketName(): string {
    return 'posters';
  }
}
