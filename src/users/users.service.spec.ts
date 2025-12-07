import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, Role } from './entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'user1@test.com', role: Role.USER },
        { id: 2, name: 'User 2', email: 'user2@test.com', role: Role.ADMIN },
      ];

      mockUserRepo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepo.find).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by role', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'user1@test.com', role: Role.USER },
      ];

      mockUserRepo.find.mockResolvedValue(users);

      const result = await service.findAll(Role.USER);

      expect(result).toEqual(users);
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { role: Role.USER },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'User 1', email: 'user1@test.com' };

      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { name: 'New User', email: 'new@test.com', role: Role.USER };
      const user = { id: 1, ...dto };

      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(result).toEqual(user);
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = {
        name: 'New User',
        email: 'existing@test.com',
        role: Role.USER,
      };
      const existing = { id: 1, email: 'existing@test.com' };

      mockUserRepo.findOne.mockResolvedValue(existing);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
