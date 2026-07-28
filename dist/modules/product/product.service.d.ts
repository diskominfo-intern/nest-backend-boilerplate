import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../core/dto/pagination.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto): Promise<{
        name: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: {
            name: string;
            price: number;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: number): Promise<{
        name: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        name: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
