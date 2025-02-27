import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../storage/storage';

@Injectable()
export class AvatarsStorage extends StorageRepository {
  protected getBucketName(): string {
    return 'avatars';
  }
}
