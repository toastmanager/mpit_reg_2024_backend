import { PartialType } from '@nestjs/swagger';
import { CreateActivityReviewDto } from './create-activity-review.dto';

export class UpdateActivityReviewDto extends PartialType(
  CreateActivityReviewDto,
) {}
