import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseResponseMessagePage,BaseResponseMessage } from 'src/common/base-response-messages/base-response';
import { ErrorCode, ErrorMessage } from 'src/common/error-code.enum';

@Injectable()
export class AccountsService {
  private logger = new Logger(AccountsService.name);
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}
  async validateAccount(username: string, password: string) {
    const account = await this.accountRepository.findOne({
      where: { username },
    });

    if (
      (account && !bcrypt.compareSync(password, account.password)) ||
      !account
    ) {
      return false;
    }

    return {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
    };
  }

  async create(createAccountDto: CreateAccountDto) {
    const resp = new BaseResponseMessage();
    const checkExist = await this.accountRepository.findOne({
      where: { username: createAccountDto.username },
    });
    if (checkExist) {
     resp.error = {
        Code:  ErrorCode.ACCOUNT_EXIST,
        Message: ErrorMessage[ErrorCode.ACCOUNT_EXIST],
      };
      return resp;
     }
    const account = this.accountRepository.create(createAccountDto);
    await this.accountRepository.save(account);
    return {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
    };
  }

  async findById(id: number) {
    const account = await this.accountRepository.findOne({
      where: { id },
      select: ['id', 'username', 'fullName', 'email', 'phone'],
    });
    return account;
  }

  async findAll() {
    const accounts = await this.accountRepository.find();
    return accounts.map((account) => {
      return {
        id: account.id,
        username: account.username,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
      };
    });
  }
}
