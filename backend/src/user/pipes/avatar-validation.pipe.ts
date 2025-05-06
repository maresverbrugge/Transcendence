import {
    PipeTransform, Injectable, BadRequestException,
  } from '@nestjs/common';
import { UploadedFileType } from '../interfaces';

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  private readonly maxSizeInBytes = 2 * 1024 * 1024; // 2MB

  transform(file: UploadedFileType):  UploadedFileType {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Validate file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG and PNG are allowed.');
    }

    // Validate file size
    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException('File size exceeds 2MB limit.');
    }

    return file;
  }
}