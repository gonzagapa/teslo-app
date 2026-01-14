import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { validate as IsUUID } from 'uuid';
import { PaginatioDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {

    private logger = new Logger('ProductsService');//Errores en consola amigables


    constructor(
      //El repositorio se encarga de las operaciones directas con la base de datos
      @InjectRepository(Product)
      private readonly productRepository:Repository<Product>
    ){

    }

  async create(createProductDto: CreateProductDto) {

    try{
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    }catch(e){
     this.handleExcpetion(e);
    }
  }

  async findAll(paginationDto:PaginatioDto) {
    const {limit = 10, offset = 0} = paginationDto;
    try{
      const product = await this.productRepository.find({
        take:limit,
        skip:offset
      });

      return product
    }catch(e){
      this.handleExcpetion(e)
    }
  }

  async findOne(term: string) {
    let product:Product|null = null;
    try{
      if(IsUUID(term)){

        product = await this.productRepository.findOneBy({id:term})
      }else{
        product = await this.productRepository.findOneBy({slug:term})
      }
      return product;
    }catch(e){
      this.handleExcpetion(e)
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    if(product)
      await this.productRepository.remove(product);
  }

  private handleExcpetion(error:any){
    
    if(error.code == '23505'){
      throw new BadRequestException(error.detail)
    }
    if(error.code == '23502')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('ERRORRR')
  }

}
