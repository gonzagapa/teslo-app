import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title:string

    @IsOptional()
    @IsString()
    description?:string 

    @IsString({each:true})
    @IsArray()
    sizes:string[]

    @IsNumber()
    @IsPositive()
    @IsOptional()
    stock?:number

    @IsOptional()
    @IsString()
    slug?:string


    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?:number

    @IsIn(['male', 'female', 'kind', 'unisex'])
    @IsOptional()
    @IsString()
    gender?:string 

    @IsString({each:true})
    @IsArray()
    @IsOptional()
    tags:string[]
}
