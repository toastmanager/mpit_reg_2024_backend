import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class StorageConfig {
  @IsNotEmpty()
  @Value('S3_ACCESS_KEY_ID')
  accessKeyId: string;

  @IsNotEmpty()
  @Value('S3_SECRET_ACCESS_KEY')
  secretAccessKey: string;

  @IsNotEmpty()
  @Value('S3_ENDPOINT')
  endpoint: string;

  @IsNotEmpty()
  @Value('S3_FORCE_PATH_STYLE')
  isForcePathStyle: boolean;

  @IsNotEmpty()
  @Value('S3_REGION')
  region: string;
}
