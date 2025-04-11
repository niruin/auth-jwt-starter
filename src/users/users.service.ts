import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { DefaultResponse } from 'common/interfaces/interface';
import { User } from './models/users.model';
import { CreateUserDto } from './dto/create-user.dto';
import {
  EnumUserRole,
  UsersListResponse,
  UserResponseData,
  UserProfileResponse,
} from './interfaces/users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(createUserDto: CreateUserDto): Promise<DefaultResponse> {
    const { email, role = EnumUserRole.EMPLOYEE } = createUserDto;
    const isExists = await this.userModel.findOne({
      where: {
        email,
      },
    });

    if (isExists) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser: CreateUserDto = {
      email,
      password: hashedPassword,
      role: role,
    };
    await this.userModel.create({ ...newUser, password: hashedPassword });

    return {
      status: 'success',
      statusCode: HttpStatus.CREATED,
      message: ['Успешная регистрация нового пользователя'],
    };
  }

  async findOne(userId: number): Promise<UserProfileResponse> {
    const { id, email, role } = await this.userModel.findOne({ where: { id: userId } });

    return {
      data: { id, email, role },
      status: 'success',
      statusCode: HttpStatus.OK,
      message: ['Данные получены'],
    };
  }

  async findAll(page: number, size: number): Promise<UsersListResponse> {
    if (page < 1 || size < 1) {
      throw new BadRequestException(['Параметры пагинации некорректны']);
    }

    try {
      const { rows, count } = await this.userModel.findAndCountAll({
        offset: (page - 1) * size,
        limit: size,
        order: [['id', 'DESC']],
        raw: true,
      });

      const data: UserResponseData[] = rows.map((item) => ({
        id: item.id,
        email: item.email,
        role: item.role,
      }));

      return {
        status: 'success',
        message: ['Данные получены'],
        statusCode: HttpStatus.OK,
        data,
        meta: {
          totalCount: count,
          page,
          size,
          totalPages: Math.ceil(count / size),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async update(updateUserDto: UpdateUserDto, userId: number): Promise<DefaultResponse> {
    try {
      const [rowsUpdated] = await this.userModel.update(updateUserDto, {
        where: { id: userId },
      });

      if (rowsUpdated === 0) {
        const messages = ['Пользователь с указанным ID не найден, данные не изменены'];
        throw new NotFoundException(messages);
      }

      return {
        status: 'success',
        message: ['Данные обновлены'],
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<DefaultResponse> {
    const numericId = Number(id);

    if (isNaN(numericId)) {
      throw new BadRequestException(['Некорректный идентификатор']);
    }

    const user = await this.userModel.findOne({
      where: { id },
      raw: true,
    });

    if (!user) {
      throw new NotFoundException([`Элемент с идентификатором '${id}' не найден`]);
    }

    try {
      await user.destroy();

      return {
        status: 'success',
        message: ['Элемент удален'],
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }
}
