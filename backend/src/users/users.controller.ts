import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateUser(@Request() req, @Param('id') id: string, @Body('name') name: string, @Body('role') role: string, @Body('department') department: string, @Body('status') status: string) {
        // verify current user is Admin
        const currentUser = await this.usersService.findById(req.user.sub);
        if (!currentUser || !currentUser.role || currentUser.role.toLowerCase() !== 'admin') {
            throw new UnauthorizedException('Only Admins can modify members');
        }
        
        await this.usersService.updateProfile(Number(id), { name, role, department, status });
        return { message: 'Member updated successfully' };
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteUser(@Request() req, @Param('id') id: string) {
        const currentUser = await this.usersService.findById(req.user.sub);
        if (!currentUser || !currentUser.role || currentUser.role.toLowerCase() !== 'admin') {
            throw new UnauthorizedException('Only Admins can delete members');
        }
        
        // Prevent deleting oneself
        if (Number(id) === req.user.sub) {
            throw new UnauthorizedException('You cannot delete your own account');
        }
        
        await this.usersService.deleteUser(Number(id));
        return { message: 'Member deleted successfully' };
    }
}