import { Entity, EntityRepository, Repository } from "typeorm";
import { Task } from "./task.entity";
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException, Delete } from '@nestjs/common';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from "src/auth/user.entity";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    async getTasks(
        filterDto: GetTasksFilterDto,
        user: User,
    ): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('task');

        query.where('task.userId = :userId',{ userId: user.id })

        if(status){
            query.andWhere('task.status = :status',{ status });
        }

        if(search){
            query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });
        }

        const tasks = await query.getMany();
        return tasks;
    }

    async createTask(
        createTaskDto: CreateTaskDto,
        user: User,
    ): Promise<Task> {
        const { title,description } = createTaskDto;

        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;
        await task.save();

        delete task.user;
        return task;
    }

    deleteTask(id: number): void {
        const task = new Task();
        const found = this.findOne(id);
        if(!found) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
        // found.delete();
        // return this.taskRepository.deleteTask(id);
        // return found;
    }
}

